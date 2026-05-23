import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { WorkshopRow } from '@/types/database'

const COLS =
  'id, title, description, price, image_url, video_url, is_active, created_at, updated_at'

export type WorkshopInput = {
  title: string
  description: string | null
  price: number
  image_url: string | null
  video_url: string | null
  is_active: boolean
}

export async function fetchActiveWorkshops() {
  return runQuery<WorkshopRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('workshops')
      .select(COLS)
      .eq('is_active', true)
      .order('title', { ascending: true })
    return { data: (data as WorkshopRow[]) ?? [], error }
  })
}

export async function fetchAllWorkshopsAdmin() {
  return runQuery<WorkshopRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('workshops')
      .select(COLS)
      .order('created_at', { ascending: false })
    return { data: (data as WorkshopRow[]) ?? [], error }
  })
}

export async function createWorkshop(input: WorkshopInput) {
  return runQuery<WorkshopRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('workshops')
      .insert(input)
      .select(COLS)
      .single()
    return { data: (data as WorkshopRow | null) ?? null, error }
  })
}

export async function updateWorkshop(id: string, input: Partial<WorkshopInput>) {
  return runQuery<WorkshopRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('workshops')
      .update(input)
      .eq('id', id)
      .select(COLS)
      .single()
    return { data: (data as WorkshopRow | null) ?? null, error }
  })
}

export async function deleteWorkshop(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('workshops').delete().eq('id', id)
    return { data: !error, error }
  })
}
