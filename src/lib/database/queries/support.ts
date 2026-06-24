import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import {
  isMissingColumn,
  MESSAGE_COLUMNS_FULL,
  MESSAGE_COLUMNS_LEGACY,
  shouldUseLegacyMessageColumns,
  normalizeSupportMessage,
  normalizeSupportThread,
  THREAD_COLUMNS_FULL,
  THREAD_COLUMNS_LEGACY,
  shouldUseLegacyThreadColumns,
} from '@/lib/database/queries/support-schema'
import {
  getLastMessage,
  isUnreadForAdmin,
} from '@/lib/support/unread'
import type { SupportThreadWithClient } from '@/lib/support/types'
import type {
  SupportMessageRow,
  SupportThreadRow,
} from '@/types/database'

const ACTIVE_STATUSES = ['open', 'escalated', 'ai_pending'] as const

type SupabaseResult = {
  data: unknown
  error: { message: string } | null
}

export async function fetchActiveThreadForUser(userId: string) {
  return runQuery<SupportThreadRow | null>(null, async () => {
    let result = await supabase!
      .from('support_threads')
      .select(THREAD_COLUMNS_FULL)
      .eq('user_id', userId)
      .in('status', [...ACTIVE_STATUSES])
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (result.error && isMissingColumn(result.error.message, 'last_message_at')) {
      result = await supabase!
        .from('support_threads')
        .select(THREAD_COLUMNS_FULL)
        .eq('user_id', userId)
        .in('status', [...ACTIVE_STATUSES])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    }

    if (result.error && shouldUseLegacyThreadColumns(result.error.message)) {
      result = await supabase!
        .from('support_threads')
        .select(THREAD_COLUMNS_LEGACY)
        .eq('user_id', userId)
        .in('status', [...ACTIVE_STATUSES])
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    }

    const row = result.data as Record<string, unknown> | null
    return {
      data: row ? normalizeSupportThread(row) : null,
      error: result.error,
    }
  })
}

/** @deprecated Use fetchActiveThreadForUser */
export const fetchOpenThreadForUser = fetchActiveThreadForUser

export async function createSupportThread(userId: string) {
  return runQuery<SupportThreadRow | null>(null, async () => {
    let { data, error } = await supabase!
      .from('support_threads')
      .insert({ user_id: userId, status: 'open', ai_enabled: true })
      .select(THREAD_COLUMNS_FULL)
      .single()

    if (error && isMissingColumn(error.message, 'ai_enabled')) {
      ;({ data, error } = await supabase!
        .from('support_threads')
        .insert({ user_id: userId, status: 'open' })
        .select(THREAD_COLUMNS_LEGACY)
        .single())
    }

    const row = data as Record<string, unknown> | null
    return {
      data: row ? normalizeSupportThread(row) : null,
      error,
    }
  })
}

export async function fetchSupportMessagesPage(
  threadId: string,
  options?: { before?: string; limit?: number },
) {
  const limit = options?.limit ?? 80
  return runQuery<SupportMessageRow[]>([], async () => {
    const fetchPage = async (columns: string) => {
      let query = supabase!
        .from('support_messages')
        .select(columns)
        .eq('thread_id', threadId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (options?.before) {
        query = query.lt('created_at', options.before)
      }

      return query
    }

    let { data, error } = await fetchPage(MESSAGE_COLUMNS_FULL)
    if (error && shouldUseLegacyMessageColumns(error.message)) {
      ;({ data, error } = await fetchPage(MESSAGE_COLUMNS_LEGACY))
    }

    const rows = ((data as unknown as Record<string, unknown>[]) ?? []).map((r) =>
      normalizeSupportMessage(r),
    )
    return { data: rows.reverse(), error }
  })
}

export async function fetchSupportThreadWithMessages(
  threadId: string,
  userId?: string,
) {
  return runQuery<{
    thread: SupportThreadRow
    messages: SupportMessageRow[]
  } | null>(null, async () => {
    let query = supabase!
      .from('support_threads')
      .select(
        `
        ${THREAD_COLUMNS_FULL},
        support_messages (${MESSAGE_COLUMNS_FULL})
      `,
      )
      .eq('id', threadId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    let { data, error } = await query.maybeSingle()

    if (error && shouldUseLegacyThreadColumns(error.message)) {
      let legacyQuery = supabase!
        .from('support_threads')
        .select(
          `
          ${THREAD_COLUMNS_LEGACY},
          support_messages (${MESSAGE_COLUMNS_LEGACY})
        `,
        )
        .eq('id', threadId)
      if (userId) legacyQuery = legacyQuery.eq('user_id', userId)
      ;({ data, error } = await legacyQuery.maybeSingle())
    }

    if (error || !data) {
      if (error) return { data: null, error }

      const threadOnly = await supabase!
        .from('support_threads')
        .select(THREAD_COLUMNS_LEGACY)
        .eq('id', threadId)
        .maybeSingle()

      if (!threadOnly.data) return { data: null, error: threadOnly.error }

      const messagesRes = await fetchSupportMessagesPage(threadId)
      return {
        data: {
          thread: normalizeSupportThread(
            threadOnly.data as Record<string, unknown>,
          ),
          messages: messagesRes.data,
        },
        error: messagesRes.error,
      }
    }

    const row = data as SupportThreadRow & {
      support_messages: Record<string, unknown>[] | null
    }

    const messages = [...(row.support_messages ?? [])]
      .map((m) => normalizeSupportMessage(m))
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      )

    const { support_messages: _m, ...threadRaw } = row

    return {
      data: {
        thread: normalizeSupportThread(
          threadRaw as unknown as Record<string, unknown>,
        ),
        messages,
      },
      error: null,
    }
  })
}

export async function fetchMessagesForThreads(threadIds: string[]) {
  return runQuery<SupportMessageRow[]>([], async () => {
    if (threadIds.length === 0) return { data: [], error: null }

    let result: SupabaseResult = await supabase!
      .from('support_messages')
      .select(MESSAGE_COLUMNS_FULL)
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })

    if (result.error && shouldUseLegacyMessageColumns(result.error.message)) {
      result = await supabase!
        .from('support_messages')
        .select(MESSAGE_COLUMNS_LEGACY)
        .in('thread_id', threadIds)
        .order('created_at', { ascending: false })
    }

    const { data, error } = result

    const rows = ((data as unknown as Record<string, unknown>[]) ?? []).map((r) =>
      normalizeSupportMessage(r),
    )
    return { data: rows, error }
  })
}

function groupMessagesByThread(
  messages: SupportMessageRow[],
): Map<string, SupportMessageRow[]> {
  const map = new Map<string, SupportMessageRow[]>()
  for (const msg of messages) {
    const list = map.get(msg.thread_id) ?? []
    list.push(msg)
    map.set(msg.thread_id, list)
  }
  return map
}

export async function fetchMySupportThreads(userId: string) {
  return runQuery<SupportThreadRow[]>([], async () => {
    let result: SupabaseResult = await supabase!
      .from('support_threads')
      .select(THREAD_COLUMNS_FULL)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (result.error && shouldUseLegacyThreadColumns(result.error.message)) {
      result = await supabase!
        .from('support_threads')
        .select(THREAD_COLUMNS_LEGACY)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
    }

    const { data, error } = result

    const rows = ((data as Record<string, unknown>[] | null) ?? []).map((r) =>
      normalizeSupportThread(r),
    )
    return { data: rows, error }
  })
}

export async function insertSupportMessage(input: {
  threadId: string
  senderId: string | null
  senderType: 'client' | 'admin' | 'ai'
  message: string
}) {
  return runQuery<SupportMessageRow | null>(null, async () => {
    const base = {
      thread_id: input.threadId,
      sender_id: input.senderId,
      sender_type: input.senderType,
      message: input.message,
    }

    let { data, error } = await supabase!
      .from('support_messages')
      .insert({ ...base, is_ai: input.senderType === 'ai' })
      .select(MESSAGE_COLUMNS_FULL)
      .single()

    if (error && isMissingColumn(error.message, 'is_ai')) {
      ;({ data, error } = await supabase!
        .from('support_messages')
        .insert(base)
        .select(MESSAGE_COLUMNS_LEGACY)
        .single())
    }

    const row = data as Record<string, unknown> | null
    return {
      data: row ? normalizeSupportMessage(row) : null,
      error,
    }
  })
}

export async function updateSupportThread(
  threadId: string,
  patch: Partial<
    Pick<
      SupportThreadRow,
      | 'status'
      | 'ai_failed'
      | 'ai_enabled'
      | 'ai_takeover'
      | 'assigned_admin_id'
      | 'client_last_read_at'
      | 'admin_last_read_at'
    >
  >,
) {
  return runQuery<SupportThreadRow | null>(null, async () => {
    const attemptPatch = { ...patch }

    for (let attempt = 0; attempt < 6; attempt += 1) {
      let { data, error } = await supabase!
        .from('support_threads')
        .update(attemptPatch)
        .eq('id', threadId)
        .select(THREAD_COLUMNS_FULL)
        .single()

      if (!error && data) {
        return {
          data: normalizeSupportThread(data as Record<string, unknown>),
          error: null,
        }
      }

      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : String(error)

      if (isMissingColumn(message, 'ai_enabled')) {
        delete attemptPatch.ai_enabled
        continue
      }
      if (isMissingColumn(message, 'ai_takeover')) {
        delete attemptPatch.ai_takeover
        continue
      }
      if (isMissingColumn(message, 'client_last_read_at')) {
        delete attemptPatch.client_last_read_at
        continue
      }
      if (isMissingColumn(message, 'admin_last_read_at')) {
        delete attemptPatch.admin_last_read_at
        continue
      }

      if (shouldUseLegacyThreadColumns(message)) {
        ;({ data, error } = await supabase!
          .from('support_threads')
          .update(attemptPatch)
          .eq('id', threadId)
          .select(THREAD_COLUMNS_LEGACY)
          .single())

        if (!error && data) {
          return {
            data: normalizeSupportThread(data as Record<string, unknown>),
            error: null,
          }
        }
      }

      return { data: null, error }
    }

    return { data: null, error: new Error('Actualizarea conversației a eșuat.') }
  })
}

export async function markSupportThreadReadByClient(threadId: string) {
  const result = await updateSupportThread(threadId, {
    client_last_read_at: new Date().toISOString(),
  })
  if (
    result.error &&
    isMissingColumn(result.error, 'client_last_read_at')
  ) {
    return { data: null, error: null, configured: result.configured }
  }
  return result
}

export async function markSupportThreadReadByAdmin(threadId: string) {
  const result = await updateSupportThread(threadId, {
    admin_last_read_at: new Date().toISOString(),
  })
  if (
    result.error &&
    isMissingColumn(result.error, 'admin_last_read_at')
  ) {
    return { data: null, error: null, configured: result.configured }
  }
  return result
}

export async function fetchAdminSupportThreads() {
  return runQuery<SupportThreadWithClient[]>([], async () => {
    let result: SupabaseResult = await supabase!
      .from('support_threads')
      .select(
        `
        ${THREAD_COLUMNS_FULL},
        profiles:user_id (full_name, email)
      `,
      )
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('updated_at', { ascending: false })

    if (result.error && isMissingColumn(result.error.message, 'last_message_at')) {
      result = await supabase!
        .from('support_threads')
        .select(
          `
          ${THREAD_COLUMNS_FULL},
          profiles:user_id (full_name, email)
        `,
        )
        .order('updated_at', { ascending: false })
    }

    if (result.error && shouldUseLegacyThreadColumns(result.error.message)) {
      result = await supabase!
        .from('support_threads')
        .select(
          `
          ${THREAD_COLUMNS_LEGACY},
          profiles:user_id (full_name, email)
        `,
        )
        .order('updated_at', { ascending: false })
    }

    const { data, error } = result

    type RawRow = SupportThreadRow & {
      profiles:
        | { full_name: string | null; email: string | null }
        | { full_name: string | null; email: string | null }[]
        | null
    }

    const rows = ((data ?? []) as unknown as RawRow[]).map((row) => {
      const { profiles, ...threadRaw } = row
      return {
        thread: normalizeSupportThread(
          threadRaw as unknown as Record<string, unknown>,
        ),
        profiles,
      }
    })

    const threadIds = rows.map((r) => r.thread.id)
    const messagesRes = await fetchMessagesForThreads(threadIds)
    const byThread = groupMessagesByThread(messagesRes.data)

    return {
      data: rows.map(({ thread, profiles }) => {
        const profile = Array.isArray(profiles) ? profiles[0] : profiles
        const messages = (byThread.get(thread.id) ?? []).sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        )
        const last = getLastMessage(messages)
        return {
          ...thread,
          client_name: profile?.full_name ?? null,
          client_email: profile?.email ?? null,
          last_message_preview: last?.message ?? null,
          last_message_sender: last?.sender_type ?? null,
          unread_for_admin: isUnreadForAdmin(thread, messages),
        }
      }),
      error: messagesRes.error ?? error,
    }
  })
}
