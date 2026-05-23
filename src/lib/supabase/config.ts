/** Shown when EXPO_PUBLIC_* env vars are missing or invalid in mobile/.env */
export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env'

const PLACEHOLDER_URL_MARKERS = ['your-project', 'example.supabase.co']
const PLACEHOLDER_KEY_MARKERS = ['your-anon-key', 'your_anon_key']

export type SupabaseConfigResult =
  | { configured: true; url: string; anonKey: string }
  | { configured: false; message: string }

function rejectVitePrefixed(value: string): string {
  if (value.startsWith('VITE_')) return ''
  return value
}

export function validateSupabaseEnv(
  rawUrl: string,
  rawAnonKey: string,
): SupabaseConfigResult {
  const url = rejectVitePrefixed(rawUrl.trim())
  const anonKey = rejectVitePrefixed(rawAnonKey.trim())

  if (!url || !anonKey) {
    return { configured: false, message: SUPABASE_NOT_CONFIGURED_MESSAGE }
  }

  if (
    PLACEHOLDER_URL_MARKERS.some((m) => url.includes(m)) ||
    PLACEHOLDER_KEY_MARKERS.some((m) => anonKey.includes(m))
  ) {
    return { configured: false, message: SUPABASE_NOT_CONFIGURED_MESSAGE }
  }

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:') {
      return {
        configured: false,
        message: `${SUPABASE_NOT_CONFIGURED_MESSAGE} (URL must use https://)`,
      }
    }
    if (!parsed.hostname.endsWith('supabase.co')) {
      return {
        configured: false,
        message: `${SUPABASE_NOT_CONFIGURED_MESSAGE} (URL must be a *.supabase.co project URL)`,
      }
    }
  } catch {
    return {
      configured: false,
      message: `${SUPABASE_NOT_CONFIGURED_MESSAGE} (URL is not valid)`,
    }
  }

  if (anonKey.length < 20) {
    return {
      configured: false,
      message: `${SUPABASE_NOT_CONFIGURED_MESSAGE} (anon key looks invalid)`,
    }
  }

  return { configured: true, url, anonKey }
}
