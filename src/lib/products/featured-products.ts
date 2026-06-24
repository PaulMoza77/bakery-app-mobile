import type { EnrichedDrop } from '@/lib/drops/types'
import type { ProductWithCategory } from '@/types/database'

/** Minimal product shape for horizontal carousels on the home catalog. */
export interface ProductPreview {
  id: string
  name: string
  price: number
  imageUrl: string | null
}

export function toProductPreview(product: ProductWithCategory): ProductPreview {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.image_url,
  }
}

const MOCK_POPULAR: ProductPreview[] = [
  {
    id: 'mock-popular-1',
    name: 'Croissant cu unt',
    price: 1200,
    imageUrl:
      'https://images.unsplash.com/photo-1555507036-ab1f4037528a?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'mock-popular-2',
    name: 'Ecler vanilie',
    price: 1500,
    imageUrl:
      'https://images.unsplash.com/photo-1612203985729-fa7859ea8037?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'mock-popular-3',
    name: 'Tort ciocolată',
    price: 18900,
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80',
  },
]

const MOCK_RESTOCKED: ProductPreview[] = [
  {
    id: 'mock-restocked-1',
    name: 'Pain au chocolat',
    price: 1400,
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'mock-restocked-2',
    name: 'Tartă cu fructe',
    price: 2200,
    imageUrl:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'mock-restocked-3',
    name: 'Macarons assortiment',
    price: 3500,
    imageUrl:
      'https://images.unsplash.com/photo-1569866382513-48abbf1a5736?auto=format&fit=crop&w=400&q=80',
  },
]

function mapFlaggedProducts(
  products: ProductWithCategory[],
  flag: 'is_popular' | 'is_back_in_stock',
  limit = 8,
): ProductPreview[] {
  return products
    .filter((product) => product.is_active && product[flag])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .slice(0, limit)
    .map(toProductPreview)
}

/** DB rows with is_popular=true, or mock when empty / unavailable. */
export function resolvePopularProducts(
  flaggedProducts: ProductWithCategory[],
  catalogProducts: ProductWithCategory[],
  options: { dbOk: boolean; limit?: number } = { dbOk: true },
): ProductPreview[] {
  const limit = options.limit ?? 8

  if (options.dbOk) {
    const fromQuery = mapFlaggedProducts(flaggedProducts, 'is_popular', limit)
    if (fromQuery.length > 0) return fromQuery

    const fromCatalog = mapFlaggedProducts(catalogProducts, 'is_popular', limit)
    if (fromCatalog.length > 0) return fromCatalog
  }

  return MOCK_POPULAR.slice(0, limit)
}

/** DB rows with is_back_in_stock=true, or mock when empty / unavailable. */
export function resolveRestockedProducts(
  flaggedProducts: ProductWithCategory[],
  catalogProducts: ProductWithCategory[],
  liveDrops: EnrichedDrop[],
  options: { dbOk: boolean; limit?: number } = { dbOk: true },
): ProductPreview[] {
  const limit = options.limit ?? 8

  if (options.dbOk) {
    const fromQuery = mapFlaggedProducts(flaggedProducts, 'is_back_in_stock', limit)
    if (fromQuery.length > 0) return fromQuery

    const fromCatalog = mapFlaggedProducts(catalogProducts, 'is_back_in_stock', limit)
    if (fromCatalog.length > 0) return fromCatalog

    const fromLiveDrops = liveDrops
      .filter((drop) => drop.remaining > 0)
      .slice(0, limit)
      .map((drop) => ({
        id: drop.product.id,
        name: drop.product.name,
        price: drop.product.price,
        imageUrl: drop.product.image_url,
      }))

    if (fromLiveDrops.length > 0) return fromLiveDrops
  }

  return MOCK_RESTOCKED.slice(0, limit)
}
