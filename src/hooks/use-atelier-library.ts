import { useCallback, useEffect, useMemo, useState } from 'react'
import { mapAtelierEntitlement, mapAtelierProduct } from '@/lib/atelier/mappers'
import type { AtelierEntitlementWithProduct } from '@/lib/atelier/types'
import { fetchGrantedEntitlements } from '@/lib/database/queries/atelier-entitlements'
import { fetchAtelierProductsByIds } from '@/lib/database/queries/atelier-products'

export function useAtelierLibrary(userId: string | undefined) {
  const [items, setItems] = useState<AtelierEntitlementWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)

    const entRes = await fetchGrantedEntitlements(userId)
    setConfigured(entRes.configured)
    if (entRes.error) setError(entRes.error)

    const digital = entRes.data.filter(
      (e) => e.product_type === 'workshop' || e.product_type === 'recipe',
    )
    const productIds = digital.map((e) => e.product_id)
    const productsRes = await fetchAtelierProductsByIds(productIds)
    if (productsRes.error) setError((prev) => prev ?? productsRes.error)

    const productMap = new Map(productsRes.data.map((p) => [p.id, mapAtelierProduct(p)]))
    const merged: AtelierEntitlementWithProduct[] = digital
      .map((row) => {
        const product = productMap.get(row.product_id)
        if (!product) return null
        return { ...mapAtelierEntitlement(row), product }
      })
      .filter((x): x is AtelierEntitlementWithProduct => x != null)

    setItems(merged)
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const workshops = useMemo(
    () => items.filter((i) => i.productType === 'workshop'),
    [items],
  )
  const recipes = useMemo(() => items.filter((i) => i.productType === 'recipe'), [items])

  return { items, workshops, recipes, loading, error, configured, refetch: load }
}
