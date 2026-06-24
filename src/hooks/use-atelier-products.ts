import { useCallback, useEffect, useState } from 'react'
import { mapAtelierProduct } from '@/lib/atelier/mappers'
import type { AtelierProduct, AtelierProductType } from '@/lib/atelier/types'
import { fetchAtelierProductsByType } from '@/lib/database/queries/atelier-products'

export function useAtelierProducts(type: AtelierProductType) {
  const [products, setProducts] = useState<AtelierProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await fetchAtelierProductsByType(type)
    setConfigured(res.configured)
    if (res.error) setError(res.error)
    setProducts(res.data.map(mapAtelierProduct))
    setLoading(false)
  }, [type])

  useEffect(() => {
    void load()
  }, [load])

  return { products, loading, error, configured, refetch: load }
}
