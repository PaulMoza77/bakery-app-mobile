import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import {
  getLastMessage,
  isUnreadForAdmin,
} from '@/lib/support/unread'
import type { SupportThreadWithClient } from '@/lib/support/types'
import type {
  SupportMessageRow,
  SupportThreadRow,
} from '@/types/database'

const THREAD_COLUMNS =
  'id, user_id, status, assigned_admin_id, ai_failed, client_last_read_at, admin_last_read_at, created_at, updated_at'

const MESSAGE_COLUMNS = 'id, thread_id, sender_id, sender_type, message, created_at'

const ACTIVE_STATUSES = ['open', 'escalated'] as const

export async function fetchActiveThreadForUser(userId: string) {
  return runQuery<SupportThreadRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('support_threads')
      .select(THREAD_COLUMNS)
      .eq('user_id', userId)
      .in('status', [...ACTIVE_STATUSES])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    return { data: (data as SupportThreadRow | null) ?? null, error }
  })
}

/** @deprecated Use fetchActiveThreadForUser */
export const fetchOpenThreadForUser = fetchActiveThreadForUser

export async function createSupportThread(userId: string) {
  return runQuery<SupportThreadRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('support_threads')
      .insert({ user_id: userId, status: 'open' })
      .select(THREAD_COLUMNS)
      .single()
    return { data: (data as SupportThreadRow | null) ?? null, error }
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
        ${THREAD_COLUMNS},
        support_messages (${MESSAGE_COLUMNS})
      `,
      )
      .eq('id', threadId)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.maybeSingle()

    if (!data) {
      return { data: null, error }
    }

    const row = data as SupportThreadRow & {
      support_messages: SupportMessageRow[] | null
    }

    const messages = [...(row.support_messages ?? [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )

    const { support_messages: _m, ...thread } = row

    return {
      data: { thread, messages },
      error,
    }
  })
}

export async function fetchMessagesForThreads(threadIds: string[]) {
  return runQuery<SupportMessageRow[]>([], async () => {
    if (threadIds.length === 0) return { data: [], error: null }
    const { data, error } = await supabase!
      .from('support_messages')
      .select(MESSAGE_COLUMNS)
      .in('thread_id', threadIds)
      .order('created_at', { ascending: false })
    return { data: (data as SupportMessageRow[]) ?? [], error }
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
    const { data, error } = await supabase!
      .from('support_threads')
      .select(THREAD_COLUMNS)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    return { data: (data as SupportThreadRow[]) ?? [], error }
  })
}

export async function insertSupportMessage(input: {
  threadId: string
  senderId: string | null
  senderType: 'client' | 'admin' | 'ai'
  message: string
}) {
  return runQuery<SupportMessageRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('support_messages')
      .insert({
        thread_id: input.threadId,
        sender_id: input.senderId,
        sender_type: input.senderType,
        message: input.message,
      })
      .select(MESSAGE_COLUMNS)
      .single()
    return { data: (data as SupportMessageRow | null) ?? null, error }
  })
}

export async function updateSupportThread(
  threadId: string,
  patch: Partial<
    Pick<
      SupportThreadRow,
      | 'status'
      | 'ai_failed'
      | 'assigned_admin_id'
      | 'client_last_read_at'
      | 'admin_last_read_at'
    >
  >,
) {
  return runQuery<SupportThreadRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('support_threads')
      .update(patch)
      .eq('id', threadId)
      .select(THREAD_COLUMNS)
      .single()
    return { data: (data as SupportThreadRow | null) ?? null, error }
  })
}

export async function markSupportThreadReadByClient(threadId: string) {
  return updateSupportThread(threadId, {
    client_last_read_at: new Date().toISOString(),
  })
}

export async function markSupportThreadReadByAdmin(threadId: string) {
  return updateSupportThread(threadId, {
    admin_last_read_at: new Date().toISOString(),
  })
}

export async function fetchAdminSupportThreads() {
  return runQuery<SupportThreadWithClient[]>([], async () => {
    const { data, error } = await supabase!
      .from('support_threads')
      .select(
        `
        ${THREAD_COLUMNS},
        profiles:user_id (full_name, email)
      `,
      )
      .order('updated_at', { ascending: false })

    type RawRow = SupportThreadRow & {
      profiles:
        | { full_name: string | null; email: string | null }
        | { full_name: string | null; email: string | null }[]
        | null
    }

    const rows = (data ?? []) as RawRow[]
    const threadIds = rows.map((r) => r.id)
    const messagesRes = await fetchMessagesForThreads(threadIds)
    const byThread = groupMessagesByThread(messagesRes.data)

    return {
      data: rows.map((row) => {
        const { profiles, ...thread } = row
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
