import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  dismissEscalationNotification,
  getSupportRepository,
  getSupportService,
  readPendingEscalationNotifications,
} from '@/lib/support'
import type {
  AdminEscalationNotification,
  SupportThreadWithClient,
  SupportThreadWithMessages,
} from '@/lib/support/types'

export function useAdminSupportInbox() {
  const { isAdmin } = useAuth()
  const [threads, setThreads] = useState<SupportThreadWithClient[]>([])
  const [pendingNotifications, setPendingNotifications] = useState<
    AdminEscalationNotification[]
  >([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(
    async (isRefresh = false) => {
      if (!isAdmin) {
        setThreads([])
        setLoading(false)
        return
      }

      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        const data = await getSupportRepository().listThreadsAdmin()
        setThreads(data)
        setPendingNotifications(readPendingEscalationNotifications())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Eroare la încărcare')
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [isAdmin],
  )

  useEffect(() => {
    void refetch(false)
  }, [refetch])

  const unreadCount = threads.filter((t) => t.unread_for_admin).length

  return {
    threads,
    pendingNotifications,
    unreadCount,
    loading,
    refreshing,
    error,
    refetch,
  }
}

export function useAdminSupportThread(threadId: string | null | undefined) {
  const { user, isAdmin } = useAuth()
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isAdmin || !threadId) {
      setThread(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const repo = getSupportRepository()
      const data = await repo.getThreadAdmin(threadId)
      setThread(data)
      await repo.markReadByAdmin(threadId)
      const refreshed = await repo.getThreadAdmin(threadId)
      setThread(refreshed)

      if (threadId && (data?.status === 'escalated' || data?.ai_failed)) {
        dismissEscalationNotification(threadId)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eroare')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, threadId])

  useEffect(() => {
    void load()
  }, [load])

  const joinConversation = useCallback(async () => {
    if (!user || !threadId) return
    await getSupportService().joinAsAdmin(threadId, user.id)
    await load()
  }, [user, threadId, load])

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!user || !threadId || !text.trim()) return false

      setSending(true)
      setError(null)

      try {
        if (!thread?.assigned_admin_id) {
          await getSupportService().joinAsAdmin(threadId, user.id)
        }
        await getSupportService().sendAdminMessage({
          threadId,
          adminId: user.id,
          message: text,
        })
        await load()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Trimitere eșuată')
        return false
      } finally {
        setSending(false)
      }
    },
    [user, threadId, thread?.assigned_admin_id, load],
  )

  const closeConversation = useCallback(async () => {
    if (!threadId) return
    await getSupportService().closeThread(threadId)
    await load()
  }, [threadId, load])

  return {
    thread,
    loading,
    sending,
    error,
    sendMessage,
    joinConversation,
    closeConversation,
    refetch: load,
  }
}
