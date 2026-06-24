import type { SupportMessageRow } from '@/types/database'

export type OptimisticSupportMessage = SupportMessageRow & {
  pending?: boolean
  failed?: boolean
}

export function mergeSupportMessages(
  current: OptimisticSupportMessage[],
  incoming: SupportMessageRow[],
): OptimisticSupportMessage[] {
  const map = new Map<string, OptimisticSupportMessage>()

  for (const message of current) {
    map.set(message.id, message)
  }

  for (const message of incoming) {
    const existing = map.get(message.id)
    if (existing?.pending) continue
    map.set(message.id, message)
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

export function replaceOptimisticMessage(
  messages: OptimisticSupportMessage[],
  tempId: string,
  confirmed: SupportMessageRow,
): OptimisticSupportMessage[] {
  return mergeSupportMessages(
    messages.filter((m) => m.id !== tempId),
    [confirmed],
  )
}

export function markMessageFailed(
  messages: OptimisticSupportMessage[],
  tempId: string,
): OptimisticSupportMessage[] {
  return messages.map((m) =>
    m.id === tempId ? { ...m, pending: false, failed: true } : m,
  )
}
