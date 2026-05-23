import { PlaceholderAiSupportProvider } from '@/lib/support/ai/placeholder-provider'
import type { AiSupportProvider } from '@/lib/support/ai/types'
import { PlaceholderAdminNotifier } from '@/lib/support/notifications/placeholder-notifier'
import type { AdminNotifier } from '@/lib/support/notifications/types'
import type { SupportRepository } from '@/lib/support/repository/types'
import type {
  AdminSendMessageInput,
  AdminEscalationNotification,
  SendClientMessageInput,
  SendClientMessageResult,
} from '@/lib/support/types'
import type { SupportMessageRow, SupportThreadRow } from '@/types/database'

export class SupportService {
  constructor(
    private readonly repository: SupportRepository,
    private readonly ai: AiSupportProvider = new PlaceholderAiSupportProvider(),
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

    if (thread.status === 'escalated') {
      await this.repository.markReadByClient(thread.id)
      const full = await this.repository.getThreadForUser(
        input.userId,
        thread.id,
      )
      return {
        thread: full ?? thread,
        clientMessage,
        aiMessage: null,
        escalated: true,
      }
    }

    const history = await this.loadMessages(thread.id, input.userId)
    const aiResult = await this.ai.generateReply({
      threadId: thread.id,
      userMessage: input.message,
      history,
    })

    if (aiResult.resolved && aiResult.message) {
      const aiMessage = await this.repository.insertMessage({
        threadId: thread.id,
        senderId: null,
        senderType: 'ai',
        message: aiResult.message,
      })
      await this.repository.markReadByClient(thread.id)
      const full = await this.repository.getThreadForUser(
        input.userId,
        thread.id,
      )
      return {
        thread: full ?? thread,
        clientMessage,
        aiMessage,
        escalated: false,
      }
    }

    const escalatedThread = await this.repository.escalateThread(thread.id)

    await this.repository.insertMessage({
      threadId: thread.id,
      senderId: null,
      senderType: 'ai',
      message:
        'Nu am un răspuns sigur pentru întrebarea ta. Am escaladat conversația — un coleg din echipă te va răspunde aici în curând.',
    })

    await this.notifyAdmin({
      thread: escalatedThread,
      userId: input.userId,
      preview: input.message,
      reason: aiResult.reason ?? 'AI nu a putut răspunde',
    })

    await this.repository.markReadByClient(thread.id)

    const full = await this.repository.getThreadForUser(
      input.userId,
      escalatedThread.id,
    )
    const aiFallback =
      full?.messages.filter((m) => m.sender_type === 'ai').at(-1) ?? null

    return {
      thread: full ?? escalatedThread,
      clientMessage,
      aiMessage: aiFallback,
      escalated: true,
    }
  }

  async sendAdminMessage(input: AdminSendMessageInput): Promise<SupportMessageRow> {
    const thread = await this.repository.getThreadAdmin(input.threadId)
    if (!thread) throw new Error('Conversația nu există.')

    if (!thread.assigned_admin_id) {
      await this.repository.assignAdmin(input.threadId, input.adminId)
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
    await this.repository.markReadByAdmin(threadId)
    return thread
  }

  async closeThread(threadId: string): Promise<SupportThreadRow> {
    return this.repository.closeThread(threadId)
  }

  private async resolveThread(
    userId: string,
    threadId: string,
  ): Promise<SupportThreadRow> {
    const thread = await this.repository.getThreadForUser(userId, threadId)
    if (!thread) throw new Error('Conversația nu există.')
    if (thread.status === 'closed') {
      throw new Error('Conversația este închisă. Deschide una nouă din meniu.')
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
