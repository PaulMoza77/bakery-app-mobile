import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigError,
  SUPABASE_NOT_CONFIGURED_MESSAGE,
} from '@/lib/supabase/client'
import { toUserMessage } from '@/lib/database/errors'

export interface QueryResult<T> {
  data: T
  error: string | null
  configured: boolean
}

export function getDbUnavailableResult<T>(fallback: T): QueryResult<T> {
  return {
    data: fallback,
    error: supabaseConfigError ?? SUPABASE_NOT_CONFIGURED_MESSAGE,
    configured: false,
  }
}

export async function runQuery<T>(
  fallback: T,
  runner: () => Promise<{ data: T; error: unknown }>,
): Promise<QueryResult<T>> {
  if (!isSupabaseConfigured || !supabase) {
    return getDbUnavailableResult(fallback)
  }

  try {
    const { data, error } = await runner()
    if (error) {
      return { data: fallback, error: toUserMessage(error), configured: true }
    }
    return { data, error: null, configured: true }
  } catch (err) {
    const message = toUserMessage(err)
    const configured = true
    if (message.includes('Network request failed')) {
      return {
        data: fallback,
        error: `${message} — check EXPO_PUBLIC_SUPABASE_URL in mobile/.env and your network connection.`,
        configured,
      }
    }
    return { data: fallback, error: message, configured }
  }
}
