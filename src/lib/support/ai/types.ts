import type { SupportMessageRow } from '@/types/database'

export interface AiReplyRequest {
  threadId: string
  userMessage: string
  history: SupportMessageRow[]
}

export interface AiReplyResult {
  /** When false, orchestrator escalates to admin */
  resolved: boolean
  message: string
  /** Human-readable reason for logs / escalation */
  reason?: string
}

/** Swap implementations (OpenAI, Anthropic, etc.) without changing UI */
export interface AiSupportProvider {
  readonly id: string
  generateReply(request: AiReplyRequest): Promise<AiReplyResult>
}
