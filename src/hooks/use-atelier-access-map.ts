import { useCallback, useEffect, useMemo, useState } from 'react'
import { mapAtelierEntitlement } from '@/lib/atelier/mappers'
import type { AtelierEntitlement } from '@/lib/atelier/types'
import { fetchUserEntitlements } from '@/lib/database/queries/atelier-entitlements'

export function useAtelierAccessMap(userId: string | undefined) {
  const [entitlements, setEntitlements] = useState<AtelierEntitlement[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!userId) {
      setEntitlements([])
      return
    }
    setLoading(true)
    const res = await fetchUserEntitlements(userId)
    setEntitlements(res.data.map(mapAtelierEntitlement))
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const accessByProductId = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const e of entitlements) {
      if (e.accessGranted) map.set(e.productId, true)
    }
    return map
  }, [entitlements])

  return { accessByProductId, loading, refetch: load }
}
