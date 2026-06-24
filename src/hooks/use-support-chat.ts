import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSupportToast } from '@/contexts/SupportToastContext'
import { getSupportRepository, getSupportService } from '@/lib/support'
import {
  markMessageFailed,
  mergeSupportMessages,
  type OptimisticSupportMessage,
} from '@/lib/support/message-utils'
import { subscribeToThreadMessages } from '@/lib/support/realtime'
import { shouldAiReplyToClient } from '@/lib/support/ai/policy'
import { isUnreadForClient } from '@/lib/support/unread'
import type { SupportThreadWithMessages } from '@/lib/support/types'
import { isSupabaseConfigured } from '@/lib/supabase/client'

function createTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function withoutOptimistic(
  messages: OptimisticSupportMessage[],
): OptimisticSupportMessage[] {
  return messages.filter(
    (m) => !m.pending && !m.failed && !m.id.startsWith('temp-'),
  )
}

export function useSupportChat(options?: { notifyWhenBackground?: boolean }) {
  const { user } = useAuth()
  const { showToast } = useSupportToast()
  const [thread, setThread] = useState<SupportThreadWithMessages | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [sendError, setSendError] = useState<string | null>(null)
  const [aiNotice, setAiNotice] = useState<string | null>(null)
  const [retryText, setRetryText] = useState<string | null>(null)
  const notifyWhenBackground = options?.notifyWhenBackground ?? false
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadThread = useCallback(async () => {
    if (!user) {
      setThread(null)
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      setLoadError('Supabase nu este configurat.')
      setThread(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setLoadError(null)

    try {
      const repo = getSupportRepository()
      const active = await repo.getOrCreateActiveThread(user.id)
      const full = await repo.getThreadForUser(user.id, active.id)
      if (!full) {
        setThread(null)
        return
      }
      await repo.markReadByClient(active.id)
      const refreshed = await repo.getThreadForUser(user.id, active.id)
      if (mountedRef.current) setThread(refreshed)
    } catch (err) {
      if (mountedRef.current) {
        setLoadError(err instanceof Error ? err.message : 'Eroare la încărcare')
        setThread(null)
      }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadThread()
  }, [loadThread])

  useEffect(() => {
    if (!thread?.id || !user || thread.id === 'pending') return

    const unsubscribe = subscribeToThreadMessages(thread.id, (incoming) => {
      setThread((prev) => {
        if (!prev) return prev
        const merged = mergeSupportMessages(
          withoutOptimistic(prev.messages as OptimisticSupportMessage[]),
          [incoming],
        )
        return { ...prev, messages: merged }
      })

      if (incoming.sender_type === 'admin' && notifyWhenBackground) {
        showToast({
          kind: 'admin_reply',
          title: 'Răspuns de la echipă',
          body: incoming.message.slice(0, 120),
        })
      }

      if (incoming.sender_type === 'admin') {
        void getSupportRepository().markReadByClient(thread.id)
      }
    })

    return unsubscribe
  }, [thread?.id, user, notifyWhenBackground, showToast])

  const hasUnreadFromTeam = useMemo(() => {
    if (!thread) return false
    return isUnreadForClient(thread, thread.messages)
  }, [thread])

  const aiAssistantActive = useMemo(() => {
    if (!thread) return true
    return shouldAiReplyToClient(thread)
  }, [thread])

  const sendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!user || !text.trim() || !isSupabaseConfigured) return false

      const trimmed = text.trim()
      setSending(true)
      setSendError(null)
      setAiNotice(null)

      const tempId = createTempId()
      const optimistic: OptimisticSupportMessage = {
        id: tempId,
        thread_id: thread?.id ?? 'pending',
        sender_id: user.id,
        sender_type: 'client',
        message: trimmed,
        is_ai: false,
        created_at: new Date().toISOString(),
        pending: true,
      }

      setThread((prev) => {
        if (!prev) {
          return {
            id: 'pending',
            user_id: user.id,
            status: 'open',
            assigned_admin_id: null,
            ai_failed: false,
            ai_enabled: true,
            ai_takeover: false,
            client_last_read_at: null,
            admin_last_read_at: null,
            last_message_at: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            messages: [optimistic],
          } as SupportThreadWithMessages
        }
        return {
          ...prev,
          messages: [
            ...withoutOptimistic(prev.messages as OptimisticSupportMessage[]),
            optimistic,
          ],
        }
      })

      try {
        const result = await getSupportService().sendClientMessage({
          userId: user.id,
          threadId: thread?.id !== 'pending' ? thread?.id : undefined,
          message: trimmed,
        })

        const full = await getSupportRepository().getThreadForUser(
          user.id,
          result.thread.id,
        )

        if (full && mountedRef.current) {
          setThread(full)
          setRetryText(null)
          if (result.aiUnavailable) {
            setAiNotice(
              'Asistentul AI nu este disponibil momentan — echipa îți va răspunde în curând.',
            )
          }
        }
        return true
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Mesajul nu a putut fi trimis'
        setSendError(message)
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
    [user, thread?.id],
  )

  const startNewConversation = useCallback(async () => {
    if (!user || !isSupabaseConfigured) return
    setLoadError(null)
    setSendError(null)
    setAiNotice(null)
    try {
      const repo = getSupportRepository()
      const threads = await repo.listThreadsForUser(user.id)
      const active = threads.find(
        (t) =>
          t.status === 'open' ||
          t.status === 'escalated' ||
          t.status === 'ai_pending',
      )
      if (active) {
        await repo.closeThread(active.id)
      }
      const created = await repo.getOrCreateActiveThread(user.id)
      const full = await repo.getThreadForUser(user.id, created.id)
      setThread(full)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Eroare')
    }
  }, [user])

  return {
    thread,
    loading,
    sending,
    error: loadError ?? sendError,
    loadError,
    sendError,
    aiNotice,
    retryText,
    sendMessage,
    startNewConversation,
    hasUnreadFromTeam,
    aiAssistantActive,
    refetch: loadThread,
    isConfigured: isSupabaseConfigured,
  }
}
