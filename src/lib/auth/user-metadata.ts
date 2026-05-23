import type { User } from '@supabase/supabase-js'

export function getDisplayNameFromUser(user: User): string | null {
  const meta = user.user_metadata ?? {}
  const direct = meta.full_name ?? meta.name
  if (typeof direct === 'string' && direct.trim()) {
    return direct.trim()
  }
  const given =
    typeof meta.given_name === 'string' ? meta.given_name.trim() : ''
  const family =
    typeof meta.family_name === 'string' ? meta.family_name.trim() : ''
  const combined = [given, family].filter(Boolean).join(' ')
  return combined || null
}
