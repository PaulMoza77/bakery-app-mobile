import { useCallback, useEffect, useState } from 'react'
import {
  buildCakeCatalog,
  EMPTY_CAKE_CATALOG,
  isCakeCatalogReady,
  type CakeCatalog,
} from '@/lib/cake-builder/catalog'
import {
  fetchActiveCakeAddons,
  fetchActiveCakeOptions,
} from '@/lib/database/queries/cake-catalog'

export function useCakeCatalog() {
  const [catalog, setCatalog] = useState<CakeCatalog>(EMPTY_CAKE_CATALOG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [optionsRes, addonsRes] = await Promise.all([
      fetchActiveCakeOptions(),
      fetchActiveCakeAddons(),
    ])

    setConfigured(optionsRes.configured && addonsRes.configured)
    const err = optionsRes.error ?? addonsRes.error
    if (err) setError(err)

    setCatalog(
      buildCakeCatalog(optionsRes.data, addonsRes.data),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return {
    catalog,
    loading,
    error,
    configured,
    ready: isCakeCatalogReady(catalog),
    refetch: load,
  }
}
