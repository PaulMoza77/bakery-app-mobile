import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { fetchMyCustomCakeOrders } from '@/lib/database/queries/cake-catalog'
import {
  cancelMyOrder,
  fetchMyOrdersWithItems,
} from '@/lib/database/queries/orders'
import type { CustomCakeOrderRow, OrderWithItemsAndProducts } from '@/types/database'

export function useMyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<OrderWithItemsAndProducts[]>([])
  const [customCakes, setCustomCakes] = useState<CustomCakeOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!user) {
      setOrders([])
      setCustomCakes([])
      setConfigured(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [ordersRes, cakesRes] = await Promise.all([
      fetchMyOrdersWithItems(user.id),
      fetchMyCustomCakeOrders(user.id),
    ])
    setConfigured(ordersRes.configured && cakesRes.configured)
    setOrders(ordersRes.data)
    setCustomCakes(cakesRes.data)
    setError(ordersRes.error ?? cakesRes.error ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!user) return { ok: false as const, error: 'Autentificare necesară' }
      setCancellingId(orderId)
      setError(null)
      const result = await cancelMyOrder(user.id, orderId)
      setCancellingId(null)
      if (result.error || !result.data) {
        const message =
          result.error ??
          'Comanda nu a putut fi anulată. Doar comenzile în așteptare pot fi anulate.'
        setError(message)
        return { ok: false as const, error: message }
      }
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: 'cancelled' as const } : o,
        ),
      )
      return { ok: true as const }
    },
    [user],
  )

  return {
    orders,
    customCakes,
    loading,
    error,
    configured,
    cancellingId,
    refetch,
    cancelOrder,
  }
}
