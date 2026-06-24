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
import { useFocusEffect, usePathname } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { useSupportToast } from '@/contexts/SupportToastContext'
import { fetchActiveThreadForUser } from '@/lib/database/queries/support'
import { getSupportRepository } from '@/lib/support'
import { subscribeToThreadMessages } from '@/lib/support/realtime'
import { isUnreadForClient } from '@/lib/support/unread'
import { isSupabaseConfigured } from '@/lib/supabase/client'

interface SupportUnreadContextValue {
  unread: number
  refresh: () => Promise<void>
}

const SupportUnreadContext = createContext<SupportUnreadContextValue | null>(null)

export function SupportUnreadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const { showToast } = useSupportToast()
  const [unread, setUnread] = useState(0)
  const lastKnown = useRef(0)
  const threadIdRef = useRef<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      lastKnown.current = 0
      threadIdRef.current = null
      setUnread(0)
      return
    }
    try {
      const activeRes = await fetchActiveThreadForUser(user.id)
      if (!activeRes.data) {
        lastKnown.current = 0
        threadIdRef.current = null
        setUnread(0)
        return
      }
      threadIdRef.current = activeRes.data.id
      const repo = getSupportRepository()
      const full = await repo.getThreadForUser(user.id, activeRes.data.id)
      if (!full) {
        lastKnown.current = 0
        setUnread(0)
        return
      }
      const count = isUnreadForClient(full, full.messages) ? 1 : 0
      lastKnown.current = count
      setUnread(count)
    } catch {
      setUnread(lastKnown.current)
    }
  }, [user])

  useFocusEffect(
    useCallback(() => {
      void refresh()
    }, [refresh]),
  )

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return

    let unsubscribe = () => {}

    void (async () => {
      await refresh()
      const threadId = threadIdRef.current
      if (!threadId) return

      unsubscribe = subscribeToThreadMessages(threadId, (message) => {
        if (message.sender_type === 'admin' || message.sender_type === 'ai') {
          void refresh()
          if (pathname !== '/chat') {
            showToast({
              kind: 'admin_reply',
              title:
                message.sender_type === 'ai'
                  ? 'Răspuns de la asistentul AI'
                  : 'Răspuns de la echipă',
              body: message.message.slice(0, 120),
            })
          }
        }
      })
    })()

    return () => {
      unsubscribe()
    }
  }, [user, refresh, pathname, showToast])

  const value = useMemo(() => ({ unread, refresh }), [unread, refresh])

  return (
    <SupportUnreadContext.Provider value={value}>
      {children}
    </SupportUnreadContext.Provider>
  )
}

export function useSupportUnread(): SupportUnreadContextValue {
  const ctx = useContext(SupportUnreadContext)
  if (!ctx) {
    throw new Error('useSupportUnread must be used within SupportUnreadProvider')
  }
  return ctx
}
