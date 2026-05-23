import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNotificationsUnread } from '@/contexts/NotificationsUnreadContext'
import {
  fetchNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/database/queries/notifications'
import { isNotificationUnread } from '@/lib/notifications/unread'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { NotificationRow } from '@/types/database'

export type NotificationListItem = NotificationRow & { is_unread: boolean }

function mapItems(rows: NotificationRow[]): NotificationListItem[] {
  return rows.map((row) => ({
    ...row,
    is_unread: isNotificationUnread(row),
  }))
}

export function useNotifications() {
  const { user, loading: authLoading } = useAuth()
  const { refetch: refetchUnreadBadge } = useNotificationsUnread()
  const [items, setItems] = useState<NotificationListItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)

  const refetch = useCallback(async () => {
    if (authLoading) return
    if (!user) {
      setItems([])
      setUnreadCount(0)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const listRes = await fetchNotificationsForUser(user.id)
    const mapped = mapItems(listRes.data)
    setItems(mapped)
    setUnreadCount(mapped.filter((n) => n.is_unread).length)

    if (listRes.error) {
      setError(listRes.error)
    }

    setLoading(false)
    await refetchUnreadBadge()
  }, [user, authLoading, refetchUnreadBadge])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const markRead = useCallback(
    async (notificationId: string) => {
      if (!user) return
      const target = items.find((n) => n.id === notificationId)
      if (!target?.is_unread) return

      setMarking(true)
      setError(null)

      const result = await markNotificationRead(notificationId, user.id)
      if (result.error) {
        setError(result.error)
        setMarking(false)
        return
      }

      const readAt = result.data?.read_at ?? new Date().toISOString()
      setItems((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read_at: readAt, is_unread: false } : n,
        ),
      )
      setUnreadCount((c) => Math.max(0, c - 1))
      await refetchUnreadBadge()
      setMarking(false)
    },
    [user, items, refetchUnreadBadge],
  )

  const markAllRead = useCallback(async () => {
    if (!user) return
    setMarking(true)
    setError(null)

    const result = await markAllNotificationsRead(user.id)
    if (result.error) {
      setError(result.error)
      setMarking(false)
      return
    }

    const ts = new Date().toISOString()
    setItems((prev) =>
      prev.map((n) => ({
        ...n,
        read_at: n.read_at ?? ts,
        is_unread: false,
      })),
    )
    setUnreadCount(0)
    await refetchUnreadBadge()
    setMarking(false)
  }, [user, refetchUnreadBadge])

  const openNotification = useCallback(
    (notificationId: string) => {
      void markRead(notificationId)
    },
    [markRead],
  )

  return {
    items,
    unreadCount,
    loading,
    error,
    marking,
    refetch,
    markRead,
    markAllRead,
    openNotification,
    isConfigured: isSupabaseConfigured,
    requiresAuth: !user && !authLoading,
  }
}
