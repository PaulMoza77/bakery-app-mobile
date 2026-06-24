import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { CategoryRow } from '@/types/database'

const COLS = 'id, name, slug, image_url, sort_order, created_at, updated_at'

export type CategoryInput = Pick<
  CategoryRow,
  'name' | 'slug' | 'image_url' | 'sort_order'
>

export async function fetchAllCategoriesAdmin() {
  return runQuery<CategoryRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('categories')
      .select(COLS)
      .order('sort_order', { ascending: true })
    return { data: (data as CategoryRow[]) ?? [], error }
  })
}

export async function createCategory(input: CategoryInput) {
  return runQuery<CategoryRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('categories')
      .insert(input)
      .select(COLS)
      .single()
    return { data: (data as CategoryRow | null) ?? null, error }
  })
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  return runQuery<CategoryRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('categories')
      .update(input)
      .eq('id', id)
      .select(COLS)
      .single()
    return { data: (data as CategoryRow | null) ?? null, error }
  })
}

export async function countProductsInCategory(categoryId: string) {
  return runQuery<number>(0, async () => {
    const { count, error } = await supabase!
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId)
    return { data: count ?? 0, error }
  })
}

export async function deleteCategory(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('categories').delete().eq('id', id)
    return { data: !error, error }
  })
}
