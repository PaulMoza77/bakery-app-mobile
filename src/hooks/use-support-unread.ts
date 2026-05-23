import { useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchActiveThreadForUser } from '@/lib/database/queries/support'
import { getSupportRepository } from '@/lib/support'
import { isUnreadForClient } from '@/lib/support/unread'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function useSupportUnread() {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const lastKnown = useRef(0)

  const refresh = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      lastKnown.current = 0
      setUnread(0)
      return
    }
    try {
      const activeRes = await fetchActiveThreadForUser(user.id)
      if (!activeRes.data) {
        lastKnown.current = 0
        setUnread(0)
        return
      }
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

  return { unread, refresh }
}
