import type {
  SupportMessageRow,
  SupportThreadRow,
  SupportThreadStatus,
} from '@/types/database'
import type { SupportSenderType } from '@/types/database'

export interface SupportThreadWithMessages extends SupportThreadRow {
  messages: SupportMessageRow[]
}

export interface SupportThreadWithClient extends SupportThreadRow {
  client_name: string | null
  client_email: string | null
  last_message_preview: string | null
  last_message_sender: SupportSenderType | null
  unread_for_admin: boolean
}

export interface SendClientMessageInput {
  threadId?: string
  message: string
  userId: string
}

export interface SendClientMessageResult {
  thread: SupportThreadRow
  clientMessage: SupportMessageRow
  aiMessage: SupportMessageRow | null
  escalated: boolean
  aiUnavailable?: boolean
}

export interface AdminSendMessageInput {
  threadId: string
  message: string
  adminId: string
}

export interface EscalationPayload {
  threadId: string
  userId: string
  lastClientMessage: string
  reason: string
}

export interface AdminEscalationNotification {
  threadId: string
  userId: string
  clientLabel: string
  preview: string
  reason: string
  createdAt: string
}

export type { SupportSenderType, SupportThreadStatus }
