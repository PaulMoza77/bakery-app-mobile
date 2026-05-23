import type { SupportMessageRow, SupportThreadRow } from '@/types/database'

export function isUnreadForAdmin(
  thread: Pick<SupportThreadRow, 'admin_last_read_at'>,
  messages: SupportMessageRow[],
): boolean {
  const since = thread.admin_last_read_at
    ? new Date(thread.admin_last_read_at).getTime()
    : 0
  return messages.some(
    (m) =>
      m.sender_type === 'client' &&
      new Date(m.created_at).getTime() > since,
  )
}

export function isUnreadForClient(
  thread: Pick<SupportThreadRow, 'client_last_read_at'>,
  messages: SupportMessageRow[],
): boolean {
  const since = thread.client_last_read_at
    ? new Date(thread.client_last_read_at).getTime()
    : 0
  return messages.some(
    (m) =>
      (m.sender_type === 'admin' || m.sender_type === 'ai') &&
      new Date(m.created_at).getTime() > since,
  )
}

export function getLastMessage(
  messages: SupportMessageRow[],
): SupportMessageRow | null {
  if (messages.length === 0) return null
  return messages.reduce((latest, m) =>
    new Date(m.created_at).getTime() > new Date(latest.created_at).getTime()
      ? m
      : latest,
  )
}
