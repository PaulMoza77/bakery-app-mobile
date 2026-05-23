import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type {
  CakeAddonCategory,
  CakeAddonRow,
  CakeOptionRow,
  CakeOptionType,
  CustomCakeOrderRow,
  CustomCakeStatus,
} from '@/types/database'

const OPTION_COLS =
  'id, type, name, price_modifier, is_active, created_at, updated_at'
const ADDON_COLS =
  'id, name, price, category, is_active, created_at, updated_at'
const ORDER_COLS =
  'id, user_id, size, flavor, filling, cream, design_style, cake_text, printed_image_url, addons, calculated_price, status, delivery_date, notes, created_at, updated_at'

export type CakeOptionInput = {
  type: CakeOptionType
  name: string
  price_modifier: number
  is_active: boolean
}

export type CakeAddonInput = {
  name: string
  price: number
  category: CakeAddonCategory
  is_active: boolean
}

function mapAddonRow(row: Record<string, unknown>): CakeAddonRow {
  return {
    id: row.id as string,
    name: row.name as string,
    price: row.price as number,
    category: (row.category as CakeAddonCategory | undefined) ?? 'extra',
    is_active: row.is_active as boolean,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

export interface CustomCakeOrderWithClient extends CustomCakeOrderRow {
  client_name: string | null
  client_email: string | null
}

export async function fetchActiveCakeOptions() {
  return runQuery<CakeOptionRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('cake_options')
      .select(OPTION_COLS)
      .eq('is_active', true)
      .order('type')
      .order('name')
    return { data: (data as CakeOptionRow[]) ?? [], error }
  })
}

export async function fetchActiveCakeAddons() {
  return runQuery<CakeAddonRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('cake_addons')
      .select(ADDON_COLS)
      .eq('is_active', true)
      .order('name')
    return {
      data: Array.isArray(data) ? data.map((r) => mapAddonRow(r as Record<string, unknown>)) : [],
      error,
    }
  })
}

export async function fetchAllCakeOptionsAdmin() {
  return runQuery<CakeOptionRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('cake_options')
      .select(OPTION_COLS)
      .order('type')
      .order('name')
    return { data: (data as CakeOptionRow[]) ?? [], error }
  })
}

export async function createCakeOption(input: CakeOptionInput) {
  return runQuery<CakeOptionRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('cake_options')
      .insert(input)
      .select(OPTION_COLS)
      .single()
    return { data: (data as CakeOptionRow | null) ?? null, error }
  })
}

export async function updateCakeOption(
  id: string,
  input: Partial<CakeOptionInput>,
) {
  return runQuery<CakeOptionRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('cake_options')
      .update(input)
      .eq('id', id)
      .select(OPTION_COLS)
      .single()
    return { data: (data as CakeOptionRow | null) ?? null, error }
  })
}

export async function deleteCakeOption(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('cake_options').delete().eq('id', id)
    return { data: !error, error }
  })
}

export async function fetchAllCakeAddonsAdmin() {
  return runQuery<CakeAddonRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('cake_addons')
      .select(ADDON_COLS)
      .order('name')
    return {
      data: Array.isArray(data) ? data.map((r) => mapAddonRow(r as Record<string, unknown>)) : [],
      error,
    }
  })
}

export async function createCakeAddon(input: CakeAddonInput) {
  return runQuery<CakeAddonRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('cake_addons')
      .insert(input)
      .select(ADDON_COLS)
      .single()
    return { data: (data as CakeAddonRow | null) ?? null, error }
  })
}

export async function updateCakeAddon(id: string, input: Partial<CakeAddonInput>) {
  return runQuery<CakeAddonRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('cake_addons')
      .update(input)
      .eq('id', id)
      .select(ADDON_COLS)
      .single()
    return { data: (data as CakeAddonRow | null) ?? null, error }
  })
}

export async function deleteCakeAddon(id: string) {
  return runQuery<boolean>(false, async () => {
    const { error } = await supabase!.from('cake_addons').delete().eq('id', id)
    return { data: !error, error }
  })
}

export async function fetchAllCustomCakeOrdersAdmin() {
  return runQuery<CustomCakeOrderWithClient[]>([], async () => {
    const { data, error } = await supabase!
      .from('custom_cake_orders')
      .select(
        `
        ${ORDER_COLS},
        profiles:user_id ( full_name, email )
      `,
      )
      .order('created_at', { ascending: false })

    type Raw = CustomCakeOrderRow & {
      profiles:
        | { full_name: string | null; email: string | null }
        | { full_name: string | null; email: string | null }[]
        | null
    }

    const rows = (data ?? []) as Raw[]
    return {
      data: rows.map((row) => {
        const { profiles, ...order } = row
        const p = Array.isArray(profiles) ? profiles[0] : profiles
        return {
          ...order,
          client_name: p?.full_name ?? null,
          client_email: p?.email ?? null,
        }
      }),
      error,
    }
  })
}

export async function updateCustomCakeOrderStatus(
  id: string,
  status: CustomCakeStatus,
) {
  return runQuery<CustomCakeOrderRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('custom_cake_orders')
      .update({ status })
      .eq('id', id)
      .select(ORDER_COLS)
      .single()
    return { data: (data as CustomCakeOrderRow | null) ?? null, error }
  })
}

export type CustomCakeAddonSnapshot = {
  name: string
  price: number
}

export type CreateCustomCakeOrderInput = {
  user_id: string
  size: string
  flavor: string
  filling: string
  cream: string
  design_style: string
  cake_text: string | null
  printed_image_url: string | null
  addons: CustomCakeAddonSnapshot[]
  calculated_price: number
  delivery_date: string
  notes: string | null
  status?: CustomCakeStatus
}

export async function createCustomCakeOrder(input: CreateCustomCakeOrderInput) {
  return runQuery<CustomCakeOrderRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('custom_cake_orders')
      .insert({
        user_id: input.user_id,
        size: input.size,
        flavor: input.flavor,
        filling: input.filling,
        cream: input.cream,
        design_style: input.design_style,
        cake_text: input.cake_text,
        printed_image_url: input.printed_image_url,
        addons: input.addons,
        calculated_price: input.calculated_price,
        delivery_date: input.delivery_date,
        notes: input.notes,
        status: input.status ?? 'submitted',
      })
      .select(ORDER_COLS)
      .single()
    return { data: (data as CustomCakeOrderRow | null) ?? null, error }
  })
}

export async function fetchMyCustomCakeOrders(userId: string) {
  return runQuery<CustomCakeOrderRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('custom_cake_orders')
      .select(ORDER_COLS)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: (data as CustomCakeOrderRow[]) ?? [], error }
  })
}
