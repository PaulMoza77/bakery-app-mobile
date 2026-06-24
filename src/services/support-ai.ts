import { insertSupportAiLog } from '@/lib/database/queries/support-ai-logs'
import type { SupportMessageRow } from '@/types/database'

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() ?? ''
const OPENAI_MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL?.trim() || 'gpt-4o-mini'
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export const isOpenAiConfigured = Boolean(OPENAI_API_KEY)

const ESCALATE_MARKER = '[[ESCALATE]]'

const SYSTEM_PROMPT = `Ești asistentul virtual al unei patiserii artizanale (aplicația mobilă Bakery).
Răspunde în română, prietenos și concis (maxim 3 paragrafe scurte).

Poți ajuta cu:
- program / orar
- comenzi, precomenzi, drop-uri cu stoc limitat
- livrare și ridicare
- torturi personalizate (tab Customize)
- workshopuri
- status comandă (fără date personale — îndrumă spre tab Comenzi sau suport uman)

Reguli:
- Nu inventa prețuri, stocuri sau date de comandă specifice.
- Nu cere parole sau date de card.
- Dacă nu ești sigur, dacă e reclamație, rambursare, urgență medicală, sau clientul cere explicit un om, răspunde DOAR cu textul exact: ${ESCALATE_MARKER}
- Altfel oferă un răspuns util.`

export interface SupportAiReplyRequest {
  threadId: string
  userMessage: string
  history: SupportMessageRow[]
}

export interface SupportAiReplyResult {
  message: string | null
  shouldEscalate: boolean
  logNote?: string
}

interface OpenAiChatResponse {
  choices?: { message?: { content?: string | null } }[]
  error?: { message?: string }
}

function buildOpenAiMessages(
  request: SupportAiReplyRequest,
): { role: 'system' | 'user' | 'assistant'; content: string }[] {
  const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
    { role: 'system', content: SYSTEM_PROMPT },
  ]

  const recent = request.history.slice(-12)
  for (const row of recent) {
    if (row.sender_type === 'client') {
      messages.push({ role: 'user', content: row.message })
    } else if (row.sender_type === 'ai' || row.sender_type === 'admin') {
      messages.push({ role: 'assistant', content: row.message })
    }
  }

  const last = recent.at(-1)
  if (!last || last.message !== request.userMessage || last.sender_type !== 'client') {
    messages.push({ role: 'user', content: request.userMessage })
  }

  return messages
}

function parseAssistantContent(raw: string): SupportAiReplyResult {
  const trimmed = raw.trim()
  if (!trimmed) {
    return {
      message: null,
      shouldEscalate: true,
      logNote: 'Empty model response',
    }
  }

  if (trimmed.includes(ESCALATE_MARKER)) {
    return {
      message: null,
      shouldEscalate: true,
      logNote: 'Model requested escalation',
    }
  }

  return {
    message: trimmed,
    shouldEscalate: false,
  }
}

async function logAiAttempt(
  threadId: string,
  promptSummary: string,
  result: SupportAiReplyResult,
  model: string,
  errorMessage?: string,
) {
  try {
    await insertSupportAiLog({
      threadId,
      promptSummary,
      responseSummary: result.message,
      model,
      success: Boolean(result.message) && !result.shouldEscalate && !errorMessage,
      errorMessage: errorMessage ?? result.logNote ?? null,
    })
  } catch {
    /* audit log is best-effort */
  }
}

export async function generateSupportAiReply(
  request: SupportAiReplyRequest,
): Promise<SupportAiReplyResult> {
  if (!isOpenAiConfigured) {
    return {
      message: null,
      shouldEscalate: true,
      logNote: 'EXPO_PUBLIC_OPENAI_API_KEY not configured',
    }
  }

  const promptSummary = request.userMessage

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: buildOpenAiMessages(request),
        temperature: 0.35,
        max_tokens: 450,
      }),
    })

    const body = (await response.json()) as OpenAiChatResponse

    if (!response.ok) {
      const errMsg = body.error?.message ?? `OpenAI HTTP ${response.status}`
      const fail: SupportAiReplyResult = {
        message: null,
        shouldEscalate: true,
        logNote: errMsg,
      }
      await logAiAttempt(request.threadId, promptSummary, fail, OPENAI_MODEL, errMsg)
      return fail
    }

    const content = body.choices?.[0]?.message?.content ?? ''
    const parsed = parseAssistantContent(content)
    await logAiAttempt(request.threadId, promptSummary, parsed, OPENAI_MODEL)
    return parsed
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'OpenAI request failed'
    const fail: SupportAiReplyResult = {
      message: null,
      shouldEscalate: true,
      logNote: errMsg,
    }
    await logAiAttempt(request.threadId, promptSummary, fail, OPENAI_MODEL, errMsg)
    return fail
  }
}
