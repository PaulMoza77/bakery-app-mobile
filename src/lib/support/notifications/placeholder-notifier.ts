import type { AdminEscalationNotification } from '@/lib/support/types'
import type { AdminNotifier } from '@/lib/support/notifications/types'
import { appLocalStorage } from '@/lib/storage/app-local-storage'

const STORAGE_KEY = 'bakery_admin_escalation_notifications'

export function readPendingEscalationNotifications(): AdminEscalationNotification[] {
  try {
    const raw = appLocalStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as AdminEscalationNotification[]
  } catch {
    return []
  }
}

export function clearPendingEscalationNotifications(): void {
  appLocalStorage.removeItem(STORAGE_KEY)
}

export function dismissEscalationNotification(threadId: string): void {
  const existing = readPendingEscalationNotifications()
  const next = existing.filter((n) => n.threadId !== threadId)
  if (next.length === 0) {
    appLocalStorage.removeItem(STORAGE_KEY)
  } else {
    appLocalStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
}

/** Dev placeholder: persists notifications for admin UI badge until real channel exists */
export class PlaceholderAdminNotifier implements AdminNotifier {
  async notifyEscalation(payload: AdminEscalationNotification): Promise<void> {
    const existing = readPendingEscalationNotifications()
    const next = [payload, ...existing.filter((n) => n.threadId !== payload.threadId)]
    appLocalStorage.setItem(STORAGE_KEY, JSON.stringify(next.slice(0, 50)))

    if (__DEV__) {
      console.info('[support] Admin escalation notification (placeholder)', payload)
    }
  }
}
