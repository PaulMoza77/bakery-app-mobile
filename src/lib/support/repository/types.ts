import type {
  AdminSendMessageInput,
  SendClientMessageInput,
  SupportThreadWithClient,
  SupportThreadWithMessages,
} from '@/lib/support/types'
import type {
  SupportMessageRow,
  SupportThreadRow,
} from '@/types/database'

export interface CreateMessageInput {
  threadId: string
  senderId: string | null
  senderType: 'client' | 'admin' | 'ai'
  message: string
}

export interface SupportRepository {
  getOrCreateActiveThread(userId: string): Promise<SupportThreadRow>
  /** @deprecated Use getOrCreateActiveThread */
  getOrCreateOpenThread(userId: string): Promise<SupportThreadRow>
  getThreadForUser(
    userId: string,
    threadId: string,
  ): Promise<SupportThreadWithMessages | null>
  listThreadsForUser(userId: string): Promise<SupportThreadRow[]>
  listThreadsAdmin(): Promise<SupportThreadWithClient[]>
  getThreadAdmin(threadId: string): Promise<SupportThreadWithMessages | null>
  insertMessage(input: CreateMessageInput): Promise<SupportMessageRow>
  escalateThread(threadId: string): Promise<SupportThreadRow>
  assignAdmin(threadId: string, adminId: string): Promise<SupportThreadRow>
  setAiTakeover(threadId: string): Promise<SupportThreadRow>
  closeThread(threadId: string): Promise<SupportThreadRow>
  reopenThread(threadId: string): Promise<SupportThreadRow>
  markReadByClient(threadId: string): Promise<void>
  markReadByAdmin(threadId: string): Promise<void>
}

export type { SendClientMessageInput, AdminSendMessageInput }
