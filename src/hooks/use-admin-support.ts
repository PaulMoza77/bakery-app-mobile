import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupportToast } from '@/contexts/SupportToastContext'
import {
  getSupportRepository,
  getSupportService,
  readPendingEscalationNotifications,
} from '@/lib/support'
import {
  markMessageFailed,
  mergeSupportMessages,
  replaceOptimisticMessage,
  type OptimisticSupportMessage,
} from '@/lib/support/message-utils'
import {
  subscribeToSupportInbox,
  subscribeToThreadMessages,
} from '@/lib/support/realtime'
import type {
  SupportThreadWithClient,
  SupportThreadWithMessages,
} from '@/lib/support/types'

function createTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useAdminSupportInbox() {
  const { isAdmin } = useAuth()
  const { showToast } = useSupportToast()
  const [threads, setThreads] = useState<SupportThreadWithClient[]>([])
  const [pendingEscalations, setPendingEscalations] = useState(
    readPendingEscalationNotifications(),
  )
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
        setPendingEscalations(readPendingEscalationNotifications())
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

  useEffect(() => {
    if (!isAdmin) return

    return subscribeToSupportInbox(() => {
      void refetch(true)
      showToast({
        kind: 'client_message',
        title: 'Mesaj nou de la client',
      })
    })
  }, [isAdmin, refetch, showToast])

  const unreadCount = threads.filter((t) => t.unread_for_admin).length

  return {
    threads,
    pendingEscalations,
    unreadCount,
    loading,
    refreshing,
    error,
    refetch,
  }
}

export function useAdminSupportThread(threadId: string | null | undefined) {
  const { user, isAdmin } = useAuth()
  const { showToast } = useSupportToast()
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryText, setRetryText] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

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
      if (mountedRef.current) setThread(refreshed)
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Eroare')
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [isAdmin, threadId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!threadId || !isAdmin) return

    return subscribeToThreadMessages(threadId, (incoming) => {
      setThread((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          messages: mergeSupportMessages(
            prev.messages as OptimisticSupportMessage[],
            [incoming],
          ),
        }
      })

      if (incoming.sender_type === 'client') {
        showToast({
          kind: 'client_message',
          title: 'Mesaj nou de la client',
          body: incoming.message.slice(0, 120),
        })
        void getSupportRepository().markReadByAdmin(threadId)
      }
    })
  }, [threadId, isAdmin, showToast])

  const joinConversation = useCallback(async () => {
    if (!user || !threadId) return
    await getSupportService().joinAsAdmin(threadId, user.id)
    await load()
  }, [user, threadId, load])

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!user || !threadId || !text.trim()) return false

      const trimmed = text.trim()
      setSending(true)
      setError(null)
      setRetryText(null)

      const tempId = createTempId()
      const optimistic: OptimisticSupportMessage = {
        id: tempId,
        thread_id: threadId,
        sender_id: user.id,
        sender_type: 'admin',
        message: trimmed,
        is_ai: false,
        created_at: new Date().toISOString(),
        pending: true,
      }

      setThread((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, optimistic] }
          : prev,
      )

      try {
        const sent = await getSupportService().sendAdminMessage({
          threadId,
          adminId: user.id,
          message: trimmed,
        })

        setThread((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: replaceOptimisticMessage(
              prev.messages as OptimisticSupportMessage[],
              tempId,
              sent,
            ),
          }
        })
        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Trimitere eșuată'
        setError(message)
        setRetryText(trimmed)
        setThread((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: markMessageFailed(
              prev.messages as OptimisticSupportMessage[],
              tempId,
            ),
          }
        })
        return false
      } finally {
        if (mountedRef.current) setSending(false)
      }
    },
    [user, threadId],
  )

  const closeConversation = useCallback(async () => {
    if (!threadId) return
    await getSupportService().closeThread(threadId)
    showToast({
      kind: 'thread_closed',
      title: 'Conversație închisă',
    })
    await load()
  }, [threadId, load, showToast])

  const reopenConversation = useCallback(async () => {
    if (!threadId) return
    await getSupportService().reopenThread(threadId)
    await load()
  }, [threadId, load])

  return {
    thread,
    loading,
    sending,
    error,
    retryText,
    sendMessage,
    joinConversation,
    closeConversation,
    reopenConversation,
    refetch: load,
  }
}
