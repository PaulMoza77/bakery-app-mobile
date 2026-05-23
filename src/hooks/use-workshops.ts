import { useCallback, useEffect, useState } from 'react'
import { fetchActiveWorkshops } from '@/lib/database/queries/workshops'
import type { WorkshopRow } from '@/types/database'

export function useWorkshops() {
  const [workshops, setWorkshops] = useState<WorkshopRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await fetchActiveWorkshops()
    setConfigured(res.configured)
    if (res.error) setError(res.error)
    setWorkshops(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { workshops, loading, error, configured, refetch: load }
}
