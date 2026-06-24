import { useMemo, useState } from 'react'
import { getCategoryName } from '@/lib/database/mappers'
import {
  findProductCatalogSection,
  type ProductCatalogSectionSlug,
} from '@/lib/products/catalog-sections'
import type { CategoryRow, ProductWithCategory } from '@/types/database'
import { useProductsCatalog } from '@/hooks/use-products-catalog'

function resolveCategoryIds(
  categories: CategoryRow[],
  slugs: string[],
): Set<string> {
  if (slugs.length === 0) return new Set()
  return new Set(
    categories.filter((category) => slugs.includes(category.slug)).map((category) => category.id),
  )
}

function matchesSubFilter(
  product: ProductWithCategory,
  filterId: string,
  filterLabel: string,
): boolean {
  if (filterId === 'all') return true
  const hay = `${product.name} ${product.description ?? ''} ${getCategoryName(product) ?? ''}`.toLowerCase()
  return hay.includes(filterLabel.toLowerCase())
}

export function useProductSectionCatalog(sectionSlug: string | undefined) {
  const { allProducts, categories, loading, error, configured, refetch } = useProductsCatalog()
  const [subFilterId, setSubFilterId] = useState('all')

  const section = useMemo(
    () => findProductCatalogSection(sectionSlug, categories),
    [sectionSlug, categories],
  )

  const sectionCategoryIds = useMemo(
    () => resolveCategoryIds(categories, section?.categorySlugs ?? []),
    [categories, section?.categorySlugs],
  )

  const activeSubFilter = useMemo(
    () => section?.subFilters.find((filter) => filter.id === subFilterId) ?? section?.subFilters[0],
    [section, subFilterId],
  )

  const sectionProducts = useMemo(() => {
    if (!section) return []
    if (section.categorySlugs.length === 0 || sectionCategoryIds.size === 0) {
      return []
    }

    const available = allProducts.filter((product) => !product.is_preorder)

    const scoped = available.filter(
      (product) => product.category_id && sectionCategoryIds.has(product.category_id),
    )

    if (!activeSubFilter || activeSubFilter.id === 'all') {
      return scoped
    }

    const bySlug = activeSubFilter.categorySlugs?.length
      ? scoped.filter((product) => {
          const category = categories.find((item) => item.id === product.category_id)
          return category ? activeSubFilter.categorySlugs!.includes(category.slug) : false
        })
      : scoped.filter((product) =>
          matchesSubFilter(product, activeSubFilter.id, activeSubFilter.label),
        )

    return bySlug
  }, [activeSubFilter, allProducts, categories, section, sectionCategoryIds])

  return {
    section,
    sectionSlug: sectionSlug as ProductCatalogSectionSlug | undefined,
    products: sectionProducts,
    subFilterId,
    setSubFilterId,
    loading,
    error,
    configured,
    refetch,
  }
}
