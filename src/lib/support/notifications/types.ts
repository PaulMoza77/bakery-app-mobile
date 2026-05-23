import type { AdminEscalationNotification } from '@/lib/support/types'

/** Email, push, Slack, etc. — implement per channel later */
export interface AdminNotifier {
  notifyEscalation(payload: AdminEscalationNotification): Promise<void>
}
