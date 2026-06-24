import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchPublicDropsWithProducts } from '@/lib/database/queries/drops'
import {
  fetchActiveCategories,
  fetchActiveProducts,
  fetchBackInStockProducts,
  fetchPopularProducts,
  fetchPreorderProducts,
} from '@/lib/database/queries/products'
import { getCategoryName } from '@/lib/database/mappers'
import { enrichDrop, sortEnrichedDrops } from '@/lib/drops'
import { partitionDrops, pickPrimaryDrop } from '@/lib/drops/selectors'
import { resolveProductCatalogSections } from '@/lib/products/catalog-sections'
import type { DropProductSummary } from '@/lib/drops/types'
import type { CategoryRow, ProductWithCategory } from '@/types/database'

export function useProductsCatalog() {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [popularFromDb, setPopularFromDb] = useState<ProductWithCategory[]>([])
  const [restockedFromDb, setRestockedFromDb] = useState<ProductWithCategory[]>([])
  const [featuredDbOk, setFeaturedDbOk] = useState(true)
  const [rawDrops, setRawDrops] = useState<Awaited<
    ReturnType<typeof fetchPublicDropsWithProducts>
  >['data']>([])
  const [preorders, setPreorders] = useState<DropProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [now, setNow] = useState(() => new Date())

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    const [productsRes, categoriesRes, dropsRes, preordersRes, popularRes, restockedRes] =
      await Promise.all([
        fetchActiveProducts(),
        fetchActiveCategories(),
        fetchPublicDropsWithProducts(),
        fetchPreorderProducts(),
        fetchPopularProducts(),
        fetchBackInStockProducts(),
      ])

    setConfigured(
      productsRes.configured &&
        categoriesRes.configured &&
        dropsRes.configured &&
        preordersRes.configured,
    )

    const errors = [
      productsRes.error,
      categoriesRes.error,
      dropsRes.error,
      preordersRes.error,
    ].filter(Boolean) as string[]
    if (errors.length > 0) setError(errors[0])

    setProducts(productsRes.data)
    setCategories(categoriesRes.data)
    setPopularFromDb(popularRes.data)
    setRestockedFromDb(restockedRes.data)
    setFeaturedDbOk(
      productsRes.configured &&
        !productsRes.error &&
        !popularRes.error &&
        !restockedRes.error,
    )
    setRawDrops(dropsRes.data)
    setPreorders(
      preordersRes.data.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        image_url: p.image_url,
        is_preorder: p.is_preorder,
      })),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const enrichedDrops = useMemo(
    () => rawDrops.map((d) => enrichDrop(d, now)).sort(sortEnrichedDrops),
    [rawDrops, now],
  )

  const { live: liveDrops, upcoming: upcomingDrops, soldOut: soldOutDrops } =
    useMemo(() => partitionDrops(enrichedDrops), [enrichedDrops])

  const primaryDrop = useMemo(
    () => pickPrimaryDrop(enrichedDrops),
    [enrichedDrops],
  )

  const dropProductIds = useMemo(
    () => new Set(enrichedDrops.map((d) => d.product.id)),
    [enrichedDrops],
  )

  const catalogProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (p.is_preorder) return false
      if (categoryId && p.category_id !== categoryId) return false
      if (!q) return true
      const hay = `${p.name} ${p.description ?? ''} ${getCategoryName(p) ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [products, search, categoryId])

  const catalogSections = useMemo(
    () => resolveProductCatalogSections(categories),
    [categories],
  )

  return {
    products: catalogProducts,
    allProducts: products,
    categories,
    catalogSections,
    popularFromDb,
    restockedFromDb,
    featuredDbOk,
    enrichedDrops,
    liveDrops,
    upcomingDrops,
    soldOutDrops,
    primaryDrop,
    dropProductIds,
    preorders,
    loading,
    error,
    configured,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    refetch: load,
  }
}
