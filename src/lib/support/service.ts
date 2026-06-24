import { shouldAiReplyToClient } from '@/lib/support/ai/policy'
import { PlaceholderAdminNotifier } from '@/lib/support/notifications/placeholder-notifier'
import type { AdminNotifier } from '@/lib/support/notifications/types'
import type { SupportRepository } from '@/lib/support/repository/types'
import type {
  AdminEscalationNotification,
  AdminSendMessageInput,
  SendClientMessageInput,
  SendClientMessageResult,
} from '@/lib/support/types'
import type { SupportMessageRow, SupportThreadRow } from '@/types/database'
import { generateSupportAiReply } from '@/services/support-ai'

const AI_HANDOFF_MESSAGE =
  'Nu am un răspuns sigur pentru întrebarea ta. Am trimis conversația către echipă — un coleg te va răspunde aici în curând.'

export class SupportService {
  constructor(
    private readonly repository: SupportRepository,
    private readonly notifier: AdminNotifier = new PlaceholderAdminNotifier(),
  ) {}

  async sendClientMessage(
    input: SendClientMessageInput,
  ): Promise<SendClientMessageResult> {
    const thread = input.threadId
      ? await this.resolveThread(input.userId, input.threadId)
      : await this.repository.getOrCreateActiveThread(input.userId)

    const clientMessage = await this.repository.insertMessage({
      threadId: thread.id,
      senderId: input.userId,
      senderType: 'client',
      message: input.message.trim(),
    })

    let aiMessage: SupportMessageRow | null = null
    let escalated = false
    let aiUnavailable = false

    const humanHandlesThread =
      thread.status === 'escalated' ||
      thread.ai_takeover ||
      Boolean(thread.assigned_admin_id)

    if (!humanHandlesThread && shouldAiReplyToClient(thread)) {
      try {
        const history = await this.loadMessages(thread.id, input.userId)
        const aiResult = await generateSupportAiReply({
          threadId: thread.id,
          userMessage: input.message.trim(),
          history,
        })

        if (aiResult.message && !aiResult.shouldEscalate) {
          aiMessage = await this.repository.insertMessage({
            threadId: thread.id,
            senderId: null,
            senderType: 'ai',
            message: aiResult.message,
          })
        } else if (aiResult.shouldEscalate) {
          try {
            const escalatedThread = await this.repository.escalateThread(
              thread.id,
            )
            escalated = true
            aiMessage = await this.repository.insertMessage({
              threadId: thread.id,
              senderId: null,
              senderType: 'ai',
              message: AI_HANDOFF_MESSAGE,
            })
            await this.notifyAdmin({
              thread: escalatedThread,
              userId: input.userId,
              preview: input.message,
              reason: aiResult.logNote ?? 'Escaladare automată',
            })
          } catch {
            aiUnavailable = true
          }
        }
      } catch {
        aiUnavailable = true
      }
    }

    try {
      await this.repository.markReadByClient(thread.id)
    } catch {
      // read columns may be missing on older DBs
    }

    const full = await this.repository.getThreadForUser(
      input.userId,
      thread.id,
    )

    return {
      thread: full ?? thread,
      clientMessage,
      aiMessage,
      escalated: escalated || thread.status === 'escalated' || thread.ai_failed,
      aiUnavailable,
    }
  }

  async sendAdminMessage(input: AdminSendMessageInput): Promise<SupportMessageRow> {
    const thread = await this.repository.getThreadAdmin(input.threadId)
    if (!thread) throw new Error('Conversația nu există.')

    if (thread.status === 'closed') {
      await this.repository.reopenThread(input.threadId)
    }

    if (!thread.assigned_admin_id) {
      await this.repository.assignAdmin(input.threadId, input.adminId)
    } else {
      await this.repository.setAiTakeover(input.threadId)
    }

    const message = await this.repository.insertMessage({
      threadId: input.threadId,
      senderId: input.adminId,
      senderType: 'admin',
      message: input.message.trim(),
    })

    await this.repository.markReadByAdmin(input.threadId)
    return message
  }

  async joinAsAdmin(threadId: string, adminId: string): Promise<SupportThreadRow> {
    const thread = await this.repository.assignAdmin(threadId, adminId)
    await this.repository.setAiTakeover(threadId)
    await this.repository.markReadByAdmin(threadId)
    return thread
  }

  async closeThread(threadId: string): Promise<SupportThreadRow> {
    return this.repository.closeThread(threadId)
  }

  async reopenThread(threadId: string): Promise<SupportThreadRow> {
    return this.repository.reopenThread(threadId)
  }

  private async resolveThread(
    userId: string,
    threadId: string,
  ): Promise<SupportThreadRow> {
    const thread = await this.repository.getThreadForUser(userId, threadId)
    if (!thread) throw new Error('Conversația nu există.')
    if (thread.status === 'closed') {
      throw new Error('Conversația este închisă. Deschide una nouă din chat.')
    }
    return thread
  }

  private async loadMessages(
    threadId: string,
    userId: string,
  ): Promise<SupportMessageRow[]> {
    const thread = await this.repository.getThreadForUser(userId, threadId)
    return thread?.messages ?? []
  }

  private async notifyAdmin(params: {
    thread: SupportThreadRow
    userId: string
    preview: string
    reason: string
  }): Promise<void> {
    const payload: AdminEscalationNotification = {
      threadId: params.thread.id,
      userId: params.userId,
      clientLabel: 'Client',
      preview: params.preview.slice(0, 200),
      reason: params.reason,
      createdAt: new Date().toISOString(),
    }

    const adminThread = await this.repository.getThreadAdmin(params.thread.id)
    if (adminThread) {
      const clientMsg = adminThread.messages.find((m) => m.sender_type === 'client')
      if (clientMsg) {
        payload.clientLabel = 'Client'
      }
    }

    await this.notifier.notifyEscalation(payload)
  }
}
