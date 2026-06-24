import { useMemo } from 'react'
import type { EnrichedDrop } from '@/lib/drops/types'
import {
  resolvePopularProducts,
  resolveRestockedProducts,
  type ProductPreview,
} from '@/lib/products/featured-products'
import type { ProductWithCategory } from '@/types/database'

export function useProductFeaturedSections(
  catalogProducts: ProductWithCategory[],
  popularFromDb: ProductWithCategory[],
  restockedFromDb: ProductWithCategory[],
  liveDrops: EnrichedDrop[],
  featuredDbOk: boolean,
) {
  const popularProducts = useMemo<ProductPreview[]>(
    () =>
      resolvePopularProducts(popularFromDb, catalogProducts, {
        dbOk: featuredDbOk,
      }),
    [popularFromDb, catalogProducts, featuredDbOk],
  )

  const restockedProducts = useMemo<ProductPreview[]>(
    () =>
      resolveRestockedProducts(restockedFromDb, catalogProducts, liveDrops, {
        dbOk: featuredDbOk,
      }),
    [restockedFromDb, catalogProducts, liveDrops, featuredDbOk],
  )

  return { popularProducts, restockedProducts }
}
