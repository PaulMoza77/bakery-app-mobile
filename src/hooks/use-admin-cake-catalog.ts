import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useAdminMutation } from '@/hooks/use-admin-mutation'
import {
  patchById,
  removeById,
  snapshotList,
} from '@/lib/admin/optimistic-list'
import {
  createCakeAddon,
  createCakeOption,
  deleteCakeAddon,
  deleteCakeOption,
  fetchAllCakeAddonsAdmin,
  fetchAllCakeOptionsAdmin,
  fetchAllCustomCakeOrdersAdmin,
  updateCakeAddon,
  updateCakeOption,
  updateCustomCakeOrderStatus,
  type CakeAddonInput,
  type CakeOptionInput,
  type CustomCakeOrderWithClient,
} from '@/lib/database/queries/cake-catalog'
import type {
  CakeAddonRow,
  CakeOptionRow,
  CustomCakeStatus,
} from '@/types/database'

export function useAdminCakeCatalog() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [options, setOptions] = useState<CakeOptionRow[]>([])
  const [addons, setAddons] = useState<CakeAddonRow[]>([])
  const [orders, setOrders] = useState<CustomCakeOrderWithClient[]>([])
  const [loading, setLoading] = useState(true)
  const { saving, error, setError, runMutation } = useAdminMutation()

  const refetch = useCallback(async () => {
    if (authLoading || !isAdmin) {
      if (!authLoading) setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const [oRes, aRes, ordRes] = await Promise.all([
      fetchAllCakeOptionsAdmin(),
      fetchAllCakeAddonsAdmin(),
      fetchAllCustomCakeOrdersAdmin(),
    ])
    setOptions(oRes.data)
    setAddons(aRes.data)
    setOrders(ordRes.data)
    setError(oRes.error ?? aRes.error ?? ordRes.error ?? null)
    setLoading(false)
  }, [isAdmin, authLoading, setError])

  useEffect(() => {
    void refetch()
  }, [refetch])

  const createOption = (input: CakeOptionInput) =>
    runMutation(async () => {
      const r = await createCakeOption(input)
      if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
      setOptions((prev) => [r.data!, ...prev])
    })

  const updateOption = (id: string, input: Partial<CakeOptionInput>) => {
    const prev = snapshotList(options)
    return runMutation(
      async () => {
        const r = await updateCakeOption(id, input)
        if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
        setOptions((items) => patchById(items, id, r.data!))
      },
      {
        apply: () =>
          setOptions((items) => patchById<CakeOptionRow>(items, id, input)),
        rollback: () => setOptions(prev),
      },
    )
  }

  const deleteOption = (id: string) => {
    const prev = snapshotList(options)
    return runMutation(
      async () => {
        const r = await deleteCakeOption(id)
        if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
      },
      {
        apply: () => setOptions((items) => removeById(items, id)),
        rollback: () => setOptions(prev),
      },
    )
  }

  const createAddon = (input: CakeAddonInput) =>
    runMutation(async () => {
      const r = await createCakeAddon(input)
      if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
      setAddons((prev) => [r.data!, ...prev])
    })

  const updateAddon = (id: string, input: Partial<CakeAddonInput>) => {
    const prev = snapshotList(addons)
    return runMutation(
      async () => {
        const r = await updateCakeAddon(id, input)
        if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
        setAddons((items) => patchById(items, id, r.data!))
      },
      {
        apply: () => setAddons((items) => patchById<CakeAddonRow>(items, id, input)),
        rollback: () => setAddons(prev),
      },
    )
  }

  const deleteAddon = (id: string) => {
    const prev = snapshotList(addons)
    return runMutation(
      async () => {
        const r = await deleteCakeAddon(id)
        if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
      },
      {
        apply: () => setAddons((items) => removeById(items, id)),
        rollback: () => setAddons(prev),
      },
    )
  }

  const setOrderStatus = (id: string, status: CustomCakeStatus) => {
    const prev = snapshotList(orders)
    return runMutation(
      async () => {
        const r = await updateCustomCakeOrderStatus(id, status)
        if (r.error || !r.data) throw new Error(r.error ?? 'Eroare')
        setOrders((items) =>
          patchById(items, id, { status } as Partial<CustomCakeOrderWithClient>),
        )
      },
      {
        apply: () =>
          setOrders((items) =>
            patchById(items, id, { status } as Partial<CustomCakeOrderWithClient>),
          ),
        rollback: () => setOrders(prev),
      },
    )
  }

  return {
    options,
    addons,
    orders,
    loading,
    saving,
    error,
    refetch,
    createOption,
    updateOption,
    deleteOption,
    createAddon,
    updateAddon,
    deleteAddon,
    setOrderStatus,
  }
}
