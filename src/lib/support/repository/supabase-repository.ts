import {
  createSupportThread,
  fetchActiveThreadForUser,
  fetchAdminSupportThreads,
  fetchMySupportThreads,
  fetchSupportThreadWithMessages,
  insertSupportMessage,
  markSupportThreadReadByAdmin,
  markSupportThreadReadByClient,
  updateSupportThread,
} from '@/lib/database/queries/support'
import type { CreateMessageInput, SupportRepository } from '@/lib/support/repository/types'
import type {
  SupportThreadWithClient,
  SupportThreadWithMessages,
} from '@/lib/support/types'
import type { SupportThreadRow } from '@/types/database'

export class SupabaseSupportRepository implements SupportRepository {
  async getOrCreateActiveThread(userId: string): Promise<SupportThreadRow> {
    const existing = await fetchActiveThreadForUser(userId)
    if (existing.error) throw new Error(existing.error)
    if (existing.data) return existing.data

    const created = await createSupportThread(userId)
    if (created.error || !created.data) {
      throw new Error(created.error ?? 'Nu s-a putut crea conversația.')
    }
    return created.data
  }

  /** @deprecated */
  getOrCreateOpenThread(userId: string): Promise<SupportThreadRow> {
    return this.getOrCreateActiveThread(userId)
  }

  async getThreadForUser(
    userId: string,
    threadId: string,
  ): Promise<SupportThreadWithMessages | null> {
    const result = await fetchSupportThreadWithMessages(threadId, userId)
    if (result.error) throw new Error(result.error)
    if (!result.data) return null
    return {
      ...result.data.thread,
      messages: result.data.messages,
    }
  }

  async listThreadsForUser(userId: string): Promise<SupportThreadRow[]> {
    const result = await fetchMySupportThreads(userId)
    if (result.error) throw new Error(result.error)
    return result.data
  }

  async listThreadsAdmin(): Promise<SupportThreadWithClient[]> {
    const result = await fetchAdminSupportThreads()
    if (result.error) throw new Error(result.error)
    return result.data
  }

  async getThreadAdmin(
    threadId: string,
  ): Promise<SupportThreadWithMessages | null> {
    const result = await fetchSupportThreadWithMessages(threadId)
    if (result.error) throw new Error(result.error)
    if (!result.data) return null
    return {
      ...result.data.thread,
      messages: result.data.messages,
    }
  }

  async insertMessage(input: CreateMessageInput) {
    const result = await insertSupportMessage({
      threadId: input.threadId,
      senderId: input.senderId,
      senderType: input.senderType,
      message: input.message,
    })
    if (result.error || !result.data) {
      throw new Error(result.error ?? 'Mesajul nu a putut fi trimis.')
    }
    return result.data
  }

  async escalateThread(threadId: string): Promise<SupportThreadRow> {
    const result = await updateSupportThread(threadId, {
      ai_failed: true,
      status: 'escalated',
    })
    if (result.error || !result.data) {
      throw new Error(result.error ?? 'Escaladarea a eșuat.')
    }
    return result.data
  }

  async assignAdmin(
    threadId: string,
    adminId: string,
  ): Promise<SupportThreadRow> {
    const result = await updateSupportThread(threadId, {
      assigned_admin_id: adminId,
      ai_takeover: true,
    })
    if (result.error || !result.data) {
      throw new Error(result.error ?? 'Atribuirea a eșuat.')
    }
    return result.data
  }

  async setAiTakeover(threadId: string): Promise<SupportThreadRow> {
    const result = await updateSupportThread(threadId, { ai_takeover: true })
    if (result.error || !result.data) {
      throw new Error(result.error ?? 'Actualizarea a eșuat.')
    }
    return result.data
  }

  async closeThread(threadId: string): Promise<SupportThreadRow> {
    const result = await updateSupportThread(threadId, { status: 'closed' })
    if (result.error || !result.data) {
      throw new Error(result.error ?? 'Închiderea a eșuat.')
    }
    return result.data
  }

  async reopenThread(threadId: string): Promise<SupportThreadRow> {
    const result = await updateSupportThread(threadId, { status: 'open' })
    if (result.error || !result.data) {
      throw new Error(result.error ?? 'Redeschiderea a eșuat.')
    }
    return result.data
  }

  async markReadByClient(threadId: string): Promise<void> {
    const result = await markSupportThreadReadByClient(threadId)
    if (result.error) throw new Error(result.error)
  }

  async markReadByAdmin(threadId: string): Promise<void> {
    const result = await markSupportThreadReadByAdmin(threadId)
    if (result.error) throw new Error(result.error)
  }
}
