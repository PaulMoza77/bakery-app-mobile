import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getSupportRepository, getSupportService } from '@/lib/support'
import { isUnreadForClient } from '@/lib/support/unread'
import type { SupportThreadWithMessages } from '@/lib/support/types'
import { isSupabaseConfigured } from '@/lib/supabase/client'

export function useSupportChat() {
  const { user } = useAuth()
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadThread = useCallback(async () => {
    if (!user) {
      setThread(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const repo = getSupportRepository()
      const active = await repo.getOrCreateActiveThread(user.id)
      const full = await repo.getThreadForUser(user.id, active.id)
      if (full) {
        await repo.markReadByClient(active.id)
        const refreshed = await repo.getThreadForUser(user.id, active.id)
        setThread(refreshed)
      } else {
        setThread(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare la încărcare')
      setThread(null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadThread()
  }, [loadThread])

  const hasUnreadFromTeam = useMemo(() => {
    if (!thread) return false
    return isUnreadForClient(thread, thread.messages)
  }, [thread])

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!user || !text.trim()) return false

      setSending(true)
      setError(null)

      try {
        const result = await getSupportService().sendClientMessage({
          userId: user.id,
          threadId: thread?.id,
          message: text,
        })

        const full = await getSupportRepository().getThreadForUser(
          user.id,
          result.thread.id,
        )
        setThread(full)
        return true
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Mesajul nu a putut fi trimis',
        )
        return false
      } finally {
        setSending(false)
      }
    },
    [user, thread?.id],
  )

  const startNewConversation = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      const repo = getSupportRepository()
      const threads = await repo.listThreadsForUser(user.id)
      const active = threads.find(
        (t) => t.status === 'open' || t.status === 'escalated',
      )
      if (active) {
        await repo.closeThread(active.id)
      }
      const created = await repo.getOrCreateActiveThread(user.id)
      const full = await repo.getThreadForUser(user.id, created.id)
      setThread(full)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare')
    }
  }, [user])

  return {
    thread,
    loading,
    sending,
    error,
    sendMessage,
    startNewConversation,
    hasUnreadFromTeam,
    refetch: loadThread,
    isDemoMode: !isSupabaseConfigured,
  }
}
