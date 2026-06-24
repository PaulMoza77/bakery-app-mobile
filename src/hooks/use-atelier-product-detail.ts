import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { mapAtelierEntitlement, mapAtelierProduct } from '@/lib/atelier/mappers'
import type { AtelierEntitlement, AtelierProduct } from '@/lib/atelier/types'
import { fetchUserEntitlementForProduct } from '@/lib/database/queries/atelier-entitlements'
import { fetchAtelierProductById } from '@/lib/database/queries/atelier-products'

export function useAtelierProductDetail(productId: string | undefined) {
  const { user } = useAuth()
  const [product, setProduct] = useState<AtelierProduct | null>(null)
  const [entitlement, setEntitlement] = useState<AtelierEntitlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
      if (!productId) {
        setLoading(false)
        setNotFound(true)
        return
      }
      setLoading(true)
      setError(null)
      setNotFound(false)

      const productRes = await fetchAtelierProductById(productId)
      setConfigured(productRes.configured)

      if (productRes.error) setError(productRes.error)
      if (!productRes.data) {
        setProduct(null)
        setNotFound(true)
        setLoading(false)
        return
      }

      setProduct(mapAtelierProduct(productRes.data))

      if (user?.id) {
        const entRes = await fetchUserEntitlementForProduct(user.id, productId)
        if (entRes.error && !entRes.data) setError((prev) => prev ?? entRes.error)
        setEntitlement(entRes.data ? mapAtelierEntitlement(entRes.data) : null)
      } else {
        setEntitlement(null)
      }

      setLoading(false)
    },
    [productId, user?.id],
  )

  useEffect(() => {
    void load()
  }, [load])

  const hasAccess = Boolean(entitlement?.accessGranted)

  return {
    product,
    entitlement,
    hasAccess,
    loading,
    error,
    configured,
    notFound,
    refetch: load,
    setEntitlement,
  }
}
