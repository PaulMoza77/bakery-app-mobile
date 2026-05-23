import type { NotificationRow } from '@/types/database'

export function isNotificationUnread(notification: NotificationRow): boolean {
  return notification.read_at == null
}

export function countUnread(notifications: NotificationRow[]): number {
  return notifications.filter(isNotificationUnread).length
}
