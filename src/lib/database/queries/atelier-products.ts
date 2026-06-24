import type { AtelierProductType } from '@/lib/atelier/types'
import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { AtelierProductRow } from '@/types/database'

const COLS = `
  id, type, title_ro, title_en, slug, short_description_ro, description_ro,
  image_url, gallery_images, price, currency, is_active, is_featured, sort_order,
  event_date, event_time, location_name, location_address,
  seats_total, seats_available, host_name, included_items,
  video_url, duration_minutes, presenter_name, difficulty, what_you_learn,
  included_materials, workshop_category,
  pdf_url, recipe_video_url, preparation_time_minutes, ingredients_preview,
  full_content_locked, allergens, created_at, updated_at
`

export async function fetchAtelierProductsByType(type: AtelierProductType) {
  return runQuery<AtelierProductRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('atelier_products')
      .select(COLS)
      .eq('type', type)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('title_ro', { ascending: true })
    return { data: (data as AtelierProductRow[]) ?? [], error }
  })
}

export async function fetchFeaturedAtelierProducts() {
  return runQuery<AtelierProductRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('atelier_products')
      .select(COLS)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .limit(6)
    return { data: (data as AtelierProductRow[]) ?? [], error }
  })
}

export async function fetchAtelierProductById(id: string) {
  return runQuery<AtelierProductRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('atelier_products')
      .select(COLS)
      .eq('id', id)
      .eq('is_active', true)
      .maybeSingle()
    return { data: (data as AtelierProductRow | null) ?? null, error }
  })
}

export async function fetchAtelierProductsByIds(ids: string[]) {
  if (ids.length === 0) {
    return runQuery<AtelierProductRow[]>([], async () => ({ data: [], error: null }))
  }
  return runQuery<AtelierProductRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('atelier_products')
      .select(COLS)
      .in('id', ids)
      .eq('is_active', true)
    return { data: (data as AtelierProductRow[]) ?? [], error }
  })
}
