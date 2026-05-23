import { useCallback, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { createOrderWithItems } from '@/lib/database/queries/orders'
import type { DeliveryType } from '@/types/database'

function isValidDeliveryDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime())
}

export function useCheckout() {
  const { user } = useAuth()
  const { lines, clearCart, subtotalCents } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const placeOrder = useCallback(
    async (options: {
      delivery_type: DeliveryType
      delivery_date: string | null
      notes: string | null
    }) => {
      if (!user) {
        return { ok: false as const, error: 'Autentificare necesară' }
      }
      if (lines.length === 0) {
        return { ok: false as const, error: 'Coșul este gol' }
      }

      setSubmitting(true)
      setError(null)

      if (options.delivery_date && !isValidDeliveryDate(options.delivery_date)) {
        const message = 'Data livrării trebuie să fie în format AAAA-LL-ZZ (ex: 2026-06-15).'
        setError(message)
        setSubmitting(false)
        return { ok: false as const, error: message }
      }

      const deliveryDateIso = options.delivery_date
        ? new Date(`${options.delivery_date}T12:00:00`).toISOString()
        : null

      const result = await createOrderWithItems({
        userId: user.id,
        delivery_type: options.delivery_type,
        delivery_date: deliveryDateIso,
        notes: options.notes,
        items: lines.map((line) => ({
          product_id: line.productId,
          quantity: line.quantity,
          unit_price: line.unitPriceCents,
          drop_id: line.dropId,
        })),
      })

      setSubmitting(false)

      if (result.error || !result.data) {
        const message = result.error ?? 'Comanda nu a putut fi plasată'
        setError(message)
        return { ok: false as const, error: message }
      }

      clearCart()
      return { ok: true as const, order: result.data }
    },
    [user, lines, clearCart],
  )

  return {
    placeOrder,
    submitting,
    error,
    subtotalCents,
    isEmpty: lines.length === 0,
  }
}
