import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { patchById, snapshotList } from '@/lib/admin/optimistic-list'
import {
  fetchAllOrdersAdmin,
  updateOrderStatus,
  type OrderWithItemsAndClient,
} from '@/lib/database/queries/orders'
import { useAdminMutation } from '@/hooks/use-admin-mutation'
import type { OrderStatus } from '@/types/database'

export function useAdminOrders() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<OrderWithItemsAndClient[]>([])
  const [loading, setLoading] = useState(true)
  const { saving, error, setError, runMutation } = useAdminMutation()

  const refetch = useCallback(async () => {
    if (authLoading || !isAdmin) {
      if (!authLoading) setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const result = await fetchAllOrdersAdmin()
    setOrders(result.data)
    setError(result.error)
    setLoading(false)
  }, [isAdmin, authLoading, setError])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const setStatus = useCallback(
    async (orderId: string, status: OrderStatus) => {
      const prevOrders = snapshotList(orders)
      await runMutation(
        async () => {
          const result = await updateOrderStatus(orderId, status)
          if (result.error || !result.data) {
            throw new Error(result.error ?? 'Actualizare eșuată')
          }
          setOrders((prev) =>
            patchById<OrderWithItemsAndClient>(prev, orderId, {
              status: result.data!.status,
              updated_at: result.data!.updated_at,
            }),
          )
        },
        {
          apply: () =>
            setOrders((prev) =>
              patchById<OrderWithItemsAndClient>(prev, orderId, { status }),
            ),
          rollback: () => setOrders(prevOrders),
        },
      )
    },
    [orders, runMutation],
  )

  return { orders, loading, saving, error, refetch, setStatus }
}
