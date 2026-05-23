import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import {
  releaseDropStock,
  reserveDropStock,
} from '@/lib/database/queries/drops'
import type {
  DeliveryType,
  OrderItemWithProduct,
  OrderRow,
  OrderStatus,
  OrderWithItems,
  OrderWithItemsAndProducts,
} from '@/types/database'

const ORDER_COLUMNS =
  'id, user_id, status, total_amount, payment_status, delivery_type, delivery_date, notes, created_at, updated_at'

const ORDER_ITEMS_WITH_PRODUCT = `
  id, order_id, product_id, quantity, unit_price, total_price, created_at,
  products ( name, image_url )
`

export interface OrderWithItemsAndClient extends OrderWithItemsAndProducts {
  client_name: string | null
  client_email: string | null
}

type RawOrderItem = OrderItemWithProduct & {
  products:
    | { name: string; image_url: string | null }
    | { name: string; image_url: string | null }[]
    | null
}

function mapOrderItemsWithProducts(
  items: RawOrderItem[] | null | undefined,
): OrderItemWithProduct[] {
  return (items ?? []).map((item) => {
    const p = item.products
    const product = Array.isArray(p) ? p[0] : p
    return { ...item, products: product ?? null }
  })
}

export type CreateOrderItemInput = {
  product_id: string
  quantity: number
  unit_price: number
  drop_id?: string | null
}

export type CreateOrderInput = {
  userId: string
  delivery_type: DeliveryType
  delivery_date: string | null
  notes: string | null
  items: CreateOrderItemInput[]
}

export async function fetchMyOrders(userId: string) {
  return fetchMyOrdersWithItems(userId)
}

export async function fetchMyOrdersWithItems(userId: string) {
  return runQuery<OrderWithItemsAndProducts[]>([], async () => {
    const { data, error } = await supabase!
      .from('orders')
      .select(
        `
        ${ORDER_COLUMNS},
        order_items (
          ${ORDER_ITEMS_WITH_PRODUCT}
        )
      `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    type Raw = OrderWithItemsAndProducts & {
      order_items: RawOrderItem[] | null
    }

    const rows = ((data ?? []) as Raw[]).map((order) => ({
      ...order,
      order_items: mapOrderItemsWithProducts(order.order_items),
    }))

    return { data: rows, error }
  })
}

export async function fetchMyOrderById(userId: string, orderId: string) {
  return runQuery<OrderWithItems | null>(null, async () => {
    const { data, error } = await supabase!
      .from('orders')
      .select(
        `
        ${ORDER_COLUMNS},
        order_items (
          id, order_id, product_id, quantity, unit_price, total_price, created_at
        )
      `,
      )
      .eq('id', orderId)
      .eq('user_id', userId)
      .maybeSingle()
    return { data: (data as OrderWithItems | null) ?? null, error }
  })
}

export async function fetchAllOrdersAdmin() {
  return runQuery<OrderWithItemsAndClient[]>([], async () => {
    const { data, error } = await supabase!
      .from('orders')
      .select(
        `
        ${ORDER_COLUMNS},
        order_items (
          ${ORDER_ITEMS_WITH_PRODUCT}
        ),
        profiles:user_id ( full_name, email )
      `,
      )
      .order('created_at', { ascending: false })

    type Raw = OrderWithItemsAndProducts & {
      profiles:
        | { full_name: string | null; email: string | null }
        | { full_name: string | null; email: string | null }[]
        | null
    }

    const rows = (data ?? []) as unknown as Raw[]
    return {
      data: rows.map((row) => {
        const { profiles, order_items, ...order } = row
        const p = Array.isArray(profiles) ? profiles[0] : profiles
        return {
          ...order,
          order_items: mapOrderItemsWithProducts(order_items),
          client_name: p?.full_name ?? null,
          client_email: p?.email ?? null,
        }
      }),
      error,
    }
  })
}

export async function cancelMyOrder(userId: string, orderId: string) {
  return runQuery<OrderRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .eq('user_id', userId)
      .eq('status', 'pending')
      .select(ORDER_COLUMNS)
      .maybeSingle()
    return { data: (data as OrderRow | null) ?? null, error }
  })
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return runQuery<OrderRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select(ORDER_COLUMNS)
      .single()
    return { data: (data as OrderRow | null) ?? null, error }
  })
}

async function validateOrderLineItems(items: CreateOrderItemInput[]) {
  const productIds = [...new Set(items.map((i) => i.product_id))]
  const { data: products, error } = await supabase!
    .from('products')
    .select('id, price, is_active, name')
    .in('id', productIds)

  if (error) return { ok: false as const, error }
  if (!products || products.length !== productIds.length) {
    return {
      ok: false as const,
      error: new Error('Unul sau mai multe produse nu mai sunt disponibile'),
    }
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.product_id)
    if (!product?.is_active) {
      return {
        ok: false as const,
        error: new Error(`Produsul „${product?.name ?? 'necunoscut'}” nu este disponibil`),
      }
    }
    if (product.price !== item.unit_price) {
      return {
        ok: false as const,
        error: new Error(
          `Prețul pentru „${product.name}” s-a schimbat. Actualizează coșul și încearcă din nou.`,
        ),
      }
    }
    if (item.quantity < 1) {
      return { ok: false as const, error: new Error('Cantitate invalidă') }
    }
  }

  return { ok: true as const }
}

export async function createOrderWithItems(input: CreateOrderInput) {
  return runQuery<OrderWithItems | null>(null, async () => {
    if (input.items.length === 0) {
      return { data: null, error: new Error('Coșul este gol') }
    }

    const validation = await validateOrderLineItems(input.items)
    if (!validation.ok) {
      return { data: null, error: validation.error }
    }

    const dropReservations: { drop_id: string; quantity: number }[] = []
    for (const item of input.items) {
      if (!item.drop_id) continue
      const reserve = await reserveDropStock(item.drop_id, item.quantity)
      if (reserve.error || !reserve.data) {
        for (const r of dropReservations) {
          await releaseDropStock(r.drop_id, r.quantity)
        }
        return {
          data: null,
          error: new Error(
            reserve.error ?? 'Stoc drop insuficient sau drop închis',
          ),
        }
      }
      dropReservations.push({ drop_id: item.drop_id, quantity: item.quantity })
    }

    const total_amount = input.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    )

    const { data: order, error: orderError } = await supabase!
      .from('orders')
      .insert({
        user_id: input.userId,
        status: 'pending',
        total_amount,
        payment_status: 'unpaid',
        delivery_type: input.delivery_type,
        delivery_date: input.delivery_date,
        notes: input.notes,
      })
      .select(ORDER_COLUMNS)
      .single()

    if (orderError || !order) {
      for (const r of dropReservations) {
        await releaseDropStock(r.drop_id, r.quantity)
      }
      return { data: null, error: orderError ?? new Error('Comanda nu a fost creată') }
    }

    const orderItems = input.items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase!
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      await supabase!.from('orders').delete().eq('id', order.id)
      for (const r of dropReservations) {
        await releaseDropStock(r.drop_id, r.quantity)
      }
      return { data: null, error: itemsError }
    }

    const { data: full, error: fetchError } = await supabase!
      .from('orders')
      .select(
        `
        ${ORDER_COLUMNS},
        order_items (
          id, order_id, product_id, quantity, unit_price, total_price, created_at
        )
      `,
      )
      .eq('id', order.id)
      .single()

    return {
      data: (full as OrderWithItems | null) ?? null,
      error: fetchError,
    }
  })
}
