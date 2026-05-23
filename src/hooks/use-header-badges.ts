import { useCart } from '@/contexts/CartContext'
import { useNotificationsUnread } from '@/contexts/NotificationsUnreadContext'
import { useSupportUnread } from '@/hooks/use-support-unread'

export function useHeaderBadges() {
  const { itemCount, hydrated } = useCart()
  const { unreadCount: notificationsUnread } = useNotificationsUnread()
  const { unread: chatUnread } = useSupportUnread()

  return {
    chatUnread,
    notificationsUnread,
    cartCount: hydrated ? itemCount : 0,
    cartBadgeReady: hydrated,
  }
}
