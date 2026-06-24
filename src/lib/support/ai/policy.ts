import { isOpenAiConfigured } from '@/services/support-ai'
import type { SupportThreadRow } from '@/types/database'

/** AI may reply when enabled, not taken over, and no admin has joined yet. */
export function shouldAiReplyToClient(thread: Pick<
  SupportThreadRow,
  'ai_enabled' | 'ai_takeover' | 'assigned_admin_id' | 'status'
>): boolean {
  if (!isOpenAiConfigured) return false
  if (!thread.ai_enabled || thread.ai_takeover) return false
  if (thread.assigned_admin_id) return false
  if (thread.status === 'closed') return false
  return true
}
