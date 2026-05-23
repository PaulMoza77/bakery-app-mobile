import type { User } from '@supabase/supabase-js'
import { getDisplayNameFromUser } from '@/lib/auth/user-metadata'
import { normalizeProfile } from '@/lib/auth/profile-role'
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

/**
 * Loads profile with retries. Creates a client profile only when the row is
 * genuinely missing (not when the fetch failed due to network/RLS).
 */
export async function resolveProfileForUser(
  user: User,
): Promise<{ profile: Profile | null; error: string | null }> {
  let lastError: string | null = null

  for (let attempt = 0; attempt < PROFILE_FETCH_ATTEMPTS; attempt++) {
    const result = await fetchProfileById(user.id)
    if (result.data) {
      return { profile: result.data, error: null }
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
