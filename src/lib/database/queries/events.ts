import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'

export interface EventRow {
  id: string
  title: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

const COLS =
  'id, title, description, image_url, sort_order, is_active, created_at, updated_at'

export type EventInput = {
  title: string
  description: string | null
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export async function fetchActiveEvents() {
  return runQuery<EventRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('events')
      .select(COLS)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    return { data: (data as EventRow[]) ?? [], error }
  })
}

export async function fetchAllEventsAdmin() {
  return runQuery<EventRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('events')
      .select(COLS)
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true })
    return { data: (data as EventRow[]) ?? [], error }
  })
}

export async function createEvent(input: EventInput) {
  return runQuery<EventRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('events')
      .insert(input)
      .select(COLS)
      .single()
    return { data: (data as EventRow | null) ?? null, error }
  })
}

export async function updateEvent(id: string, input: Partial<EventInput>) {
  return runQuery<EventRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('events')
      .update(input)
      .eq('id', id)
      .select(COLS)
      .single()
    return { data: (data as EventRow | null) ?? null, error }
  })
}

export async function deleteEvent(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('events').delete().eq('id', id)
    return { data: !error, error }
  })
}
