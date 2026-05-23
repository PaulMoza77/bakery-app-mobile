import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchUnreadNotificationCount } from '@/lib/database/queries/notifications'

interface NotificationsUnreadContextValue {
  unreadCount: number
  refetch: () => Promise<void>
}

const NotificationsUnreadContext =
  createContext<NotificationsUnreadContextValue | null>(null)

export function NotificationsUnreadProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const lastKnown = useRef(0)

  const refetch = useCallback(async () => {
    if (!user) {
      lastKnown.current = 0
      setUnreadCount(0)
      return
    }
    const result = await fetchUnreadNotificationCount(user.id)
    if (result.error) {
      setUnreadCount(lastKnown.current)
      return
    }
    lastKnown.current = result.data
    setUnreadCount(result.data)
  }, [user])

  useEffect(() => {
    if (authLoading) return
    void refetch()
  }, [authLoading, refetch])

  const value = useMemo(
    () => ({ unreadCount, refetch }),
    [unreadCount, refetch],
  )

  return (
    <NotificationsUnreadContext.Provider value={value}>
      {children}
    </NotificationsUnreadContext.Provider>
  )
}

export function useNotificationsUnread() {
  const ctx = useContext(NotificationsUnreadContext)
  if (!ctx) {
    throw new Error('useNotificationsUnread must be used within NotificationsUnreadProvider')
  }
  return ctx
}
