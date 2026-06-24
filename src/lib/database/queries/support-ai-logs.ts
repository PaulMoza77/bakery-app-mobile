import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'

export interface SupportAiLogInput {
  threadId: string
  promptSummary: string
  responseSummary: string | null
  model: string
  success: boolean
  errorMessage?: string | null
}

export async function insertSupportAiLog(input: SupportAiLogInput) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('support_ai_logs').insert({
      thread_id: input.threadId,
      prompt_summary: input.promptSummary.slice(0, 2000),
      response_summary: input.responseSummary?.slice(0, 2000) ?? null,
      model: input.model,
      success: input.success,
      error_message: input.errorMessage ?? null,
    })
    return { data: !error, error }
  })
}
