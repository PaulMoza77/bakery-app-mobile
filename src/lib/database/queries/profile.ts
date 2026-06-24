import type { User } from '@supabase/supabase-js'
import { getDisplayNameFromUser } from '@/lib/auth/user-metadata'
import { isAdminRole, normalizeProfile } from '@/lib/auth/profile-role'
import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { ProfileUpdate } from '@/types/database'
import type { Profile } from '@/types/auth'

const PROFILE_COLUMNS =
  'id, email, full_name, phone, role, created_at, updated_at'

const PROFILE_FETCH_ATTEMPTS = 8
const PROFILE_FETCH_DELAY_MS = 300

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeEmail(email: string | null | undefined): string | null {
  const value = email?.trim().toLowerCase()
  return value ? value : null
}

/** Prefer admin row when multiple profiles share the same email. */
export function pickProfileForAuthUser(
  profiles: Profile[],
  user: User,
): Profile | null {
  if (profiles.length === 0) return null

  const byId = profiles.find((profile) => profile.id === user.id)
  const adminByEmail = profiles.find((profile) => isAdminRole(profile.role))
  const chosen = adminByEmail ?? byId ?? profiles[0]

  if (chosen.id === user.id) {
    return chosen
  }

  return {
    ...chosen,
    id: user.id,
    email: user.email ?? chosen.email,
    full_name: chosen.full_name?.trim() || getDisplayNameFromUser(user),
  }
}

export async function fetchProfileById(userId: string) {
  return runQuery<Profile | null>(null, async () => {
    const { data, error } = await supabase!
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .eq('id', userId)
      .maybeSingle()
    const profile = data ? normalizeProfile(data as Profile) : null
    return { data: profile, error }
  })
}

export async function fetchProfilesByEmail(email: string) {
  const normalized = normalizeEmail(email)
  if (!normalized) {
    return { data: [] as Profile[], error: null }
  }

  return runQuery<Profile[]>([], async () => {
    const { data, error } = await supabase!
      .from('profiles')
      .select(PROFILE_COLUMNS)
      .ilike('email', normalized)
    const profiles = (data ?? []).map((row) => normalizeProfile(row as Profile))
    return { data: profiles, error }
  })
}

/**
 * Fetches profile by auth id, then email (via RPC when available).
 * Does not create profiles — use for refresh / debug.
 */
export async function fetchResolvedProfileForUser(
  user: User,
): Promise<{ profile: Profile | null; error: string | null }> {
  const rpcResult = await runQuery<Profile | null>(null, async () => {
    const { data, error } = await supabase!.rpc('get_my_resolved_profile').maybeSingle()
    const profile = data ? normalizeProfile(data as Profile) : null
    return { data: profile, error }
  })

  if (rpcResult.data) {
    return { profile: rpcResult.data, error: null }
  }

  if (rpcResult.error && !rpcResult.error.includes('Could not find the function')) {
    if (__DEV__) {
      console.warn('[Profile] get_my_resolved_profile failed:', rpcResult.error)
    }
  }

  const byId = await fetchProfileById(user.id)
  let profileById = byId.data
  let lastError = byId.error

  let profileByEmail: Profile | null = null
  if (user.email) {
    const emailResult = await fetchProfilesByEmail(user.email)
    if (emailResult.error) {
      lastError = lastError ?? emailResult.error
    } else {
      profileByEmail = pickProfileForAuthUser(emailResult.data, user)
    }
  }

  if (profileById || profileByEmail) {
    if (profileById && profileByEmail) {
      const role =
        isAdminRole(profileByEmail.role) || isAdminRole(profileById.role)
          ? 'admin'
          : profileById.role
      return {
        profile: {
          ...profileById,
          id: user.id,
          email: user.email ?? profileById.email ?? profileByEmail.email,
          role,
        },
        error: null,
      }
    }

    return {
      profile: profileById ?? profileByEmail,
      error: null,
    }
  }

  return { profile: null, error: lastError }
}

/**
 * Loads profile with retries. Creates a client profile only when the row is
 * genuinely missing (not when the fetch failed due to network/RLS).
 */
export async function resolveProfileForUser(
  user: User,
): Promise<{ profile: Profile | null; error: string | null }> {
  let lastError: string | null = null

  for (let attempt = 0; attempt < PROFILE_FETCH_ATTEMPTS; attempt++) {
    const result = await fetchResolvedProfileForUser(user)
    if (result.profile) {
      return result
    }
    lastError = result.error
    if (result.error) {
      await delay(PROFILE_FETCH_DELAY_MS)
      continue
    }
    break
  }

  if (lastError) {
    if (__DEV__) {
      console.warn('[Profile] fetch failed after retries:', lastError)
    }
    return { profile: null, error: lastError }
  }

  const profile = await ensureProfileForUser(user)
  return { profile, error: profile ? null : 'Profilul nu a putut fi încărcat.' }
}

/** Create client profile if auth trigger did not run yet (e.g. OAuth). */
export async function ensureProfileForUser(user: User): Promise<Profile | null> {
  const existing = await fetchProfileById(user.id)
  if (existing.data) {
    return existing.data
  }

  if (user.email) {
    const byEmail = await fetchProfilesByEmail(user.email)
    const emailProfile = pickProfileForAuthUser(byEmail.data, user)
    if (emailProfile) {
      return emailProfile
    }
    if (byEmail.error) {
      if (__DEV__) {
        console.warn('[Profile] ensure skipped — email lookup failed:', byEmail.error)
      }
      return null
    }
  }

  if (existing.error) {
    const retry = await fetchProfileById(user.id)
    if (retry.data) {
      return retry.data
    }
    if (__DEV__) {
      console.warn('[Profile] ensure skipped — could not read profiles:', existing.error)
    }
    return null
  }

  const insertResult = await runQuery<Profile | null>(null, async () => {
    const { data, error } = await supabase!
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email ?? null,
        full_name: getDisplayNameFromUser(user),
        role: 'client',
      })
      .select(PROFILE_COLUMNS)
      .single()
    const profile = data ? normalizeProfile(data as Profile) : null
    return { data: profile, error }
  })

  if (insertResult.data) {
    return insertResult.data
  }

  const afterInsert = await fetchProfileById(user.id)
  return afterInsert.data
}

export async function updateProfile(userId: string, patch: ProfileUpdate) {
  return runQuery<Profile | null>(null, async () => {
    const { data, error } = await supabase!
      .from('profiles')
      .update(patch)
      .eq('id', userId)
      .select(PROFILE_COLUMNS)
      .single()
    const profile = data ? normalizeProfile(data as Profile) : null
    return { data: profile, error }
  })
}
