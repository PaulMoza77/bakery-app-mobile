import { useCallback, useEffect, useState } from 'react'
import { fetchActiveEvents, type EventRow } from '@/lib/database/queries/events'

export function useEventServices() {
  const [services, setServices] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await fetchActiveEvents()
    setConfigured(res.configured)
    if (res.error) setError(res.error)
    setServices(res.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { services, loading, error, configured, refetch: load }
}
