import type { SupportMessageRow } from '@/types/database'

export type SupportMessageInsertHandler = (message: SupportMessageRow) => void

/**
 * Realtime is disabled on React Native (no ws/stream). Hooks refetch after send;
 * admin/client screens still work via REST.
 */
export function subscribeToThreadMessages(
  _threadId: string,
  _onInsert: SupportMessageInsertHandler,
): () => void {
  return () => {}
}

/** Admin inbox: realtime disabled; list refreshes on focus and after actions. */
export function subscribeToSupportInbox(_onActivity: () => void): () => void {
  return () => {}
}
