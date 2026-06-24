import type { CreateMessageInput, SupportRepository } from '@/lib/support/repository/types'
import {
  getLastMessage,
  isUnreadForAdmin,
} from '@/lib/support/unread'
import type {
  SupportThreadWithClient,
  SupportThreadWithMessages,
} from '@/lib/support/types'
import type {
  SupportMessageRow,
  SupportThreadRow,
} from '@/types/database'
import { appLocalStorage } from '@/lib/storage/app-local-storage'

const STORAGE_KEY = 'bakery_support_store_v1'

interface LocalStore {
  threads: SupportThreadRow[]
  messages: SupportMessageRow[]
}

function loadStore(): LocalStore {
  try {
    const raw = appLocalStorage.getItem(STORAGE_KEY)
    if (!raw) return { threads: [], messages: [] }
    return JSON.parse(raw) as LocalStore
  } catch {
    return { threads: [], messages: [] }
  }
}

function saveStore(store: LocalStore): void {
  appLocalStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

function now(): string {
  return new Date().toISOString()
}

const DEMO_CLIENT = {
  name: 'Client demo',
  email: 'client@demo.local',
}

export class LocalSupportRepository implements SupportRepository {
  async getOrCreateActiveThread(userId: string): Promise<SupportThreadRow> {
    const store = loadStore()
    const active = store.threads.find(
      (t) =>
        t.user_id === userId &&
        (t.status === 'open' || t.status === 'escalated'),
    )
    if (active) return active

    const thread: SupportThreadRow = {
      id: newId('thread'),
      user_id: userId,
      status: 'open',
      assigned_admin_id: null,
      ai_failed: false,
      ai_enabled: true,
      ai_takeover: false,
      client_last_read_at: null,
      admin_last_read_at: null,
      last_message_at: null,
      created_at: now(),
      updated_at: now(),
    }
    store.threads.unshift(thread)
    saveStore(store)
    return thread
  }

  getOrCreateOpenThread(userId: string): Promise<SupportThreadRow> {
    return this.getOrCreateActiveThread(userId)
  }

  async getThreadForUser(
    userId: string,
    threadId: string,
  ): Promise<SupportThreadWithMessages | null> {
    const store = loadStore()
    const thread = store.threads.find(
      (t) => t.id === threadId && t.user_id === userId,
    )
    if (!thread) return null
    return {
      ...thread,
      messages: store.messages
        .filter((m) => m.thread_id === threadId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    }
  }

  async listThreadsForUser(userId: string): Promise<SupportThreadRow[]> {
    return loadStore()
      .threads.filter((t) => t.user_id === userId)
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
  }

  async listThreadsAdmin(): Promise<SupportThreadWithClient[]> {
    const store = loadStore()
    return store.threads
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .map((t) => {
        const messages = store.messages
          .filter((m) => m.thread_id === t.id)
          .sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime(),
          )
        const last = getLastMessage(messages)
        return {
          ...t,
          client_name: DEMO_CLIENT.name,
          client_email: DEMO_CLIENT.email,
          last_message_preview: last?.message ?? null,
          last_message_sender: last?.sender_type ?? null,
          unread_for_admin: isUnreadForAdmin(t, messages),
        }
      })
  }

  async getThreadAdmin(
    threadId: string,
  ): Promise<SupportThreadWithMessages | null> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (!thread) return null
    return {
      ...thread,
      messages: store.messages
        .filter((m) => m.thread_id === threadId)
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() -
            new Date(b.created_at).getTime(),
        ),
    }
  }

  async insertMessage(input: CreateMessageInput): Promise<SupportMessageRow> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === input.threadId)
    if (!thread) throw new Error('Conversația nu există.')

    const message: SupportMessageRow = {
      id: newId('msg'),
      thread_id: input.threadId,
      sender_id: input.senderId,
      sender_type: input.senderType,
      message: input.message,
      is_ai: input.senderType === 'ai',
      created_at: now(),
    }

    store.messages.push(message)
    thread.updated_at = now()
    thread.last_message_at = now()
    saveStore(store)
    return message
  }

  async escalateThread(threadId: string): Promise<SupportThreadRow> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (!thread) throw new Error('Conversația nu există.')
    thread.ai_failed = true
    thread.status = 'escalated'
    thread.updated_at = now()
    saveStore(store)
    return thread
  }

  async assignAdmin(
    threadId: string,
    adminId: string,
  ): Promise<SupportThreadRow> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (!thread) throw new Error('Conversația nu există.')
    thread.assigned_admin_id = adminId
    thread.ai_takeover = true
    thread.updated_at = now()
    saveStore(store)
    return thread
  }

  async setAiTakeover(threadId: string): Promise<SupportThreadRow> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (!thread) throw new Error('Conversația nu există.')
    thread.ai_takeover = true
    thread.updated_at = now()
    saveStore(store)
    return thread
  }

  async closeThread(threadId: string): Promise<SupportThreadRow> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (!thread) throw new Error('Conversația nu există.')
    thread.status = 'closed'
    thread.updated_at = now()
    saveStore(store)
    return thread
  }

  async reopenThread(threadId: string): Promise<SupportThreadRow> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (!thread) throw new Error('Conversația nu există.')
    thread.status = 'open'
    thread.updated_at = now()
    saveStore(store)
    return thread
  }

  async markReadByClient(threadId: string): Promise<void> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (thread) {
      thread.client_last_read_at = now()
      saveStore(store)
    }
  }

  async markReadByAdmin(threadId: string): Promise<void> {
    const store = loadStore()
    const thread = store.threads.find((t) => t.id === threadId)
    if (thread) {
      thread.admin_last_read_at = now()
      saveStore(store)
    }
  }
}
