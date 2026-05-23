import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { NotificationRow } from '@/types/database'

const NOTIFICATION_COLUMNS =
  'id, user_id, title, body, category, source, action_url, read_at, push_status, email_status, created_by, metadata, created_at'

export async function fetchNotificationsForUser(userId: string, limit = 50) {
  return runQuery<NotificationRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('notifications')
      .select(NOTIFICATION_COLUMNS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    return { data: (data as NotificationRow[]) ?? [], error }
  })
}

export async function fetchUnreadNotificationCount(userId: string) {
  return runQuery<number>(0, async () => {
    const { count, error } = await supabase!
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)
    return { data: count ?? 0, error }
  })
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return runQuery<NotificationRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select(NOTIFICATION_COLUMNS)
      .maybeSingle()
    return { data: (data as NotificationRow | null) ?? null, error }
  })
}

export async function markAllNotificationsRead(userId: string) {
  return runQuery<number>(0, async () => {
    const { data, error } = await supabase!
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)
      .select('id')
    return { data: data?.length ?? 0, error }
  })
}
