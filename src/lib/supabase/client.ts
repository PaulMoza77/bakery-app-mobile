import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  SUPABASE_NOT_CONFIGURED_MESSAGE,
  validateSupabaseEnv,
} from '@/lib/supabase/config'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? ''
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? ''

const config = validateSupabaseEnv(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = config.configured

export const supabaseConfigError = config.configured
  ? null
  : config.message

export { SUPABASE_NOT_CONFIGURED_MESSAGE }

if (__DEV__) {
  if (config.configured) {
    console.log('[Supabase] Connected to:', config.url)
  } else {
    console.warn('[Supabase]', config.message)
  }
}

export const supabase: SupabaseClient | null = config.configured
  ? createClient(config.url, config.anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
      realtime: {
        params: {
          eventsPerSecond: 0,
        },
      },
    })
  : null
