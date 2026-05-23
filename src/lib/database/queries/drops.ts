import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { DropWithProduct } from '@/lib/drops/types'
import type { CreateDropInput, UpdateDropInput } from '@/lib/drops/types'
import type { ProductDropRow } from '@/types/database'

const DROP_COLUMNS =
  'id, product_id, drop_date, start_time, end_time, quantity_available, quantity_sold, is_active, created_at, updated_at'

const PRODUCT_EMBED = `
  products (
    id, name, description, price, image_url, is_preorder, is_active
  )
`

type EmbeddedProduct = DropWithProduct['product'] & { is_active: boolean }

type RawDropRow = ProductDropRow & {
  products: EmbeddedProduct | EmbeddedProduct[] | null
}

function mapDropRow(row: RawDropRow, admin = false): DropWithProduct | null {
  const raw = row.products
  const productRow = Array.isArray(raw) ? raw[0] : raw
  if (!productRow) return null
  if (!admin && !productRow.is_active) return null

  const { products: _p, ...drop } = row
  return {
    ...drop,
    product: {
      id: productRow.id,
      name: productRow.name,
      description: productRow.description,
      price: productRow.price,
      image_url: productRow.image_url,
      is_preorder: productRow.is_preorder,
    },
  }
}

function mapDropRows(rows: unknown, admin = false): DropWithProduct[] {
  if (!Array.isArray(rows)) return []
  return rows
    .map((r) => mapDropRow(r as RawDropRow, admin))
    .filter((d): d is DropWithProduct => d != null)
}

export async function fetchPublicDropsForProduct(productId: string) {
  const today = new Date()
  today.setDate(today.getDate() - 1)
  const fromDate = today.toISOString().slice(0, 10)

  return runQuery<DropWithProduct[]>([], async () => {
    const { data, error } = await supabase!
      .from('product_drops')
      .select(`${DROP_COLUMNS}, ${PRODUCT_EMBED}`)
      .eq('is_active', true)
      .eq('product_id', productId)
      .gte('drop_date', fromDate)
      .order('drop_date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true })

    return { data: mapDropRows(data, false), error }
  })
}

export async function fetchPublicDropsWithProducts() {
  const from = new Date()
  from.setDate(from.getDate() - 1)
  const fromDate = from.toISOString().slice(0, 10)

  const to = new Date()
  to.setDate(to.getDate() + 60)
  const toDate = to.toISOString().slice(0, 10)

  return runQuery<DropWithProduct[]>([], async () => {
    const { data, error } = await supabase!
      .from('product_drops')
      .select(`${DROP_COLUMNS}, ${PRODUCT_EMBED}`)
      .eq('is_active', true)
      .gte('drop_date', fromDate)
      .lte('drop_date', toDate)
      .order('drop_date', { ascending: true })
      .order('start_time', { ascending: true, nullsFirst: true })

    return { data: mapDropRows(data, false), error }
  })
}

export async function fetchAdminDropsWithProducts() {
  return runQuery<DropWithProduct[]>([], async () => {
    const { data, error } = await supabase!
      .from('product_drops')
      .select(`${DROP_COLUMNS}, ${PRODUCT_EMBED}`)
      .order('drop_date', { ascending: false })
      .order('created_at', { ascending: false })

    return { data: mapDropRows(data, true), error }
  })
}

export async function insertProductDrop(input: CreateDropInput) {
  return runQuery<ProductDropRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('product_drops')
      .insert({
        product_id: input.product_id,
        drop_date: input.drop_date,
        start_time: input.start_time || null,
        end_time: input.end_time || null,
        quantity_available: input.quantity_available,
        is_active: input.is_active,
        quantity_sold: 0,
      })
      .select(DROP_COLUMNS)
      .single()
    return { data: (data as ProductDropRow | null) ?? null, error }
  })
}

export async function updateProductDrop(id: string, input: UpdateDropInput) {
  return runQuery<ProductDropRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('product_drops')
      .update(input)
      .eq('id', id)
      .select(DROP_COLUMNS)
      .single()
    return { data: (data as ProductDropRow | null) ?? null, error }
  })
}

export async function setProductDropActive(id: string, isActive: boolean) {
  return updateProductDrop(id, { is_active: isActive })
}

export async function deleteProductDrop(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('product_drops').delete().eq('id', id)
    return { data: !error, error }
  })
}

export async function reserveDropStock(dropId: string, quantity: number) {
  return runQuery<ProductDropRow | null>(null, async () => {
    const { data, error } = await supabase!.rpc('reserve_drop_stock', {
      p_drop_id: dropId,
      p_quantity: quantity,
    })
    return { data: (data as ProductDropRow | null) ?? null, error }
  })
}

export async function releaseDropStock(dropId: string, quantity: number) {
  return runQuery<ProductDropRow | null>(null, async () => {
    const { data, error } = await supabase!.rpc('release_drop_stock', {
      p_drop_id: dropId,
      p_quantity: quantity,
    })
    return { data: (data as ProductDropRow | null) ?? null, error }
  })
}
