import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPublicDropsForProduct } from '@/lib/database/queries/drops'
import { fetchPublicProductById } from '@/lib/database/queries/products'
import { enrichDrop, sortEnrichedDrops } from '@/lib/drops'
import type { DropWithProduct } from '@/lib/drops/types'
import type { ProductWithCategory } from '@/types/database'

export function useProductDetail(productId: string | undefined) {
  const [product, setProduct] = useState<ProductWithCategory | null>(null)
  const [rawDrops, setRawDrops] = useState<DropWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [now, setNow] = useState(() => new Date())

  const load = useCallback(async () => {
    if (!productId) {
      setLoading(false)
      setNotFound(true)
      return
    }

    setLoading(true)
    setError(null)
    setNotFound(false)

    const [productRes, dropsRes] = await Promise.all([
      fetchPublicProductById(productId),
      fetchPublicDropsForProduct(productId),
    ])

    setConfigured(productRes.configured && dropsRes.configured)

    const errors = [productRes.error, dropsRes.error].filter(Boolean) as string[]
    if (errors.length > 0) setError(errors[0])

    if (!productRes.data) {
      setProduct(null)
      setNotFound(!productRes.error)
    } else {
      setProduct(productRes.data)
    }

    setRawDrops(dropsRes.data)
    setLoading(false)
  }, [productId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const drops = useMemo(
    () => rawDrops.map((d) => enrichDrop(d, now)).sort(sortEnrichedDrops),
    [rawDrops, now],
  )

  const liveDrops = useMemo(
    () => drops.filter((d) => d.phase === 'live' || d.phase === 'upcoming'),
    [drops],
  )

  return {
    product,
    drops,
    liveDrops,
    loading,
    error,
    configured,
    notFound,
    refetch: load,
  }
}
