import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import { mapProductRow, mapProductRows } from '@/lib/database/mappers'
import type { CategoryRow, ProductDropRow, ProductWithCategory } from '@/types/database'

const PRODUCT_COLS =
  'id, category_id, name, slug, description, short_description, price, currency, unit, image_url, is_active, is_preorder, is_popular, is_back_in_stock, is_featured, stock_status, available_from, sort_order, created_at, updated_at'

const PRODUCT_SELECT = `
  ${PRODUCT_COLS},
  categories ( id, name, slug )
`

export async function fetchActiveCategories() {
  return runQuery<CategoryRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('categories')
      .select(
        'id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at',
      )
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    return { data: (data as CategoryRow[]) ?? [], error }
  })
}

export async function fetchPopularProducts() {
  return runQuery<ProductWithCategory[]>([], async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('is_popular', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    return { data: mapProductRows(data), error }
  })
}

export async function fetchBackInStockProducts() {
  return runQuery<ProductWithCategory[]>([], async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('is_back_in_stock', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    return { data: mapProductRows(data), error }
  })
}

export async function fetchActiveProducts() {
  return runQuery<ProductWithCategory[]>([], async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    return { data: mapProductRows(data), error }
  })
}

export async function fetchProductById(productId: string) {
  return runQuery<ProductWithCategory | null>(null, async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', productId)
      .maybeSingle()
    return { data: data ? mapProductRow(data) : null, error }
  })
}

/** Active product for the public product detail page */
export async function fetchPublicProductById(productId: string) {
  return runQuery<ProductWithCategory | null>(null, async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', productId)
      .eq('is_active', true)
      .maybeSingle()
    return { data: data ? mapProductRow(data) : null, error }
  })
}

export async function fetchActiveProductDrops() {
  return runQuery<ProductDropRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('product_drops')
      .select(
        'id, product_id, drop_date, start_time, end_time, quantity_available, quantity_sold, is_active, created_at, updated_at',
      )
      .eq('is_active', true)
      .gte('drop_date', new Date().toISOString().slice(0, 10))
      .order('drop_date', { ascending: true })
    return { data: (data as ProductDropRow[]) ?? [], error }
  })
}

export async function fetchPreorderProducts() {
  return runQuery<ProductWithCategory[]>([], async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('is_active', true)
      .eq('is_preorder', true)
      .order('name', { ascending: true })
    return { data: mapProductRows(data), error }
  })
}

export type ProductInput = {
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  is_preorder: boolean
}

export async function fetchAllProductsAdmin() {
  return runQuery<ProductWithCategory[]>([], async () => {
    const { data, error } = await supabase!
      .from('products')
      .select(PRODUCT_SELECT)
      .order('created_at', { ascending: false })
    return { data: mapProductRows(data), error }
  })
}

export async function createProduct(input: ProductInput) {
  return runQuery<ProductWithCategory | null>(null, async () => {
    const { data, error } = await supabase!
      .from('products')
      .insert(input)
      .select(PRODUCT_SELECT)
      .single()
    return { data: data ? mapProductRow(data) : null, error }
  })
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  return runQuery<ProductWithCategory | null>(null, async () => {
    const { data, error } = await supabase!
      .from('products')
      .update(input)
      .eq('id', id)
      .select(PRODUCT_SELECT)
      .single()
    return { data: data ? mapProductRow(data) : null, error }
  })
}

export async function deleteProduct(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('products').delete().eq('id', id)
    return { data: !error, error }
  })
}
