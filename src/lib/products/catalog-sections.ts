import type { Ionicons } from '@expo/vector-icons'
import type { CategoryRow } from '@/types/database'

export type ProductCatalogSectionSlug = string

export interface ProductSectionSubFilter {
  id: string
  label: string
  /** Match products by category slug from DB */
  categorySlugs?: string[]
}

export interface ProductCatalogSection {
  slug: string
  title: string
  description: string
  icon: keyof typeof Ionicons.glyphMap
  /** Mock or CDN image until admin assets are wired */
  imageUrl: string
  /** Category slugs used to filter products on the section screen */
  categorySlugs: string[]
  subFilters: ProductSectionSubFilter[]
}

const DEFAULT_CATEGORY_IMAGE =
  'https://images.unsplash.com/photo-1555507036-ab1f4037528a?auto=format&fit=crop&w=800&q=80'

const CATEGORY_ICON_BY_SLUG: Record<string, keyof typeof Ionicons.glyphMap> = {
  prajituri: 'cafe-outline',
  pajituri: 'cafe-outline',
  patiserie: 'restaurant-outline',
  corporate: 'briefcase-outline',
  'evenimente-speciale': 'sparkles-outline',
  torturi: 'gift-outline',
  platouri: 'grid-outline',
}

export const PRODUCT_CATALOG_SECTIONS: ProductCatalogSection[] = [
  {
    slug: 'pajituri',
    title: 'Pajituri',
    description: 'Prăjituri, tarte și deserturi pentru orice ocazie.',
    icon: 'cafe-outline',
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    categorySlugs: ['torturi'],
    subFilters: [
      { id: 'all', label: 'Toate' },
      { id: 'clasice', label: 'Clasice' },
      { id: 'sezon', label: 'Sezon' },
      { id: 'mini', label: 'Mini' },
    ],
  },
  {
    slug: 'patiserie',
    title: 'Patiserie',
    description: 'Croissant, eclere și produse proaspăt coapte zilnic.',
    icon: 'restaurant-outline',
    imageUrl:
      'https://images.unsplash.com/photo-1555507036-ab1f4037528a?auto=format&fit=crop&w=800&q=80',
    categorySlugs: ['patiserie'],
    subFilters: [
      { id: 'all', label: 'Toate' },
      { id: 'croissant', label: 'Croissant' },
      { id: 'eclere', label: 'Eclere' },
      { id: 'tartine', label: 'Tartine' },
    ],
  },
  {
    slug: 'corporate',
    title: 'Corporate',
    description: 'Seturi cadou și comenzi pentru birou și parteneri.',
    icon: 'briefcase-outline',
    imageUrl:
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80',
    categorySlugs: [],
    subFilters: [
      { id: 'all', label: 'Toate' },
      { id: 'cadouri', label: 'Cadouri' },
      { id: 'seturi', label: 'Seturi' },
      { id: 'branding', label: 'Branding' },
    ],
  },
  {
    slug: 'evenimente-speciale',
    title: 'Evenimente Speciale',
    description: 'Torturi și deserturi pentru nunți, botezuri și petreceri.',
    icon: 'sparkles-outline',
    imageUrl:
      'https://images.unsplash.com/photo-1464349095438-e9a21285b5f3?auto=format&fit=crop&w=800&q=80',
    categorySlugs: ['torturi'],
    subFilters: [
      { id: 'all', label: 'Toate' },
      { id: 'nunti', label: 'Nunți' },
      { id: 'botezuri', label: 'Botezuri' },
      { id: 'petreceri', label: 'Petreceri' },
    ],
  },
]

export function getProductCatalogSection(
  slug: string | undefined,
): ProductCatalogSection | null {
  if (!slug) return null
  return PRODUCT_CATALOG_SECTIONS.find((section) => section.slug === slug) ?? null
}

export function mapCategoryRowToCatalogSection(category: CategoryRow): ProductCatalogSection {
  const mock = getProductCatalogSection(category.slug)
  return {
    slug: category.slug,
    title: category.name,
    description: category.description?.trim() || mock?.description || category.name,
    icon: CATEGORY_ICON_BY_SLUG[category.slug] ?? mock?.icon ?? 'layers-outline',
    imageUrl: category.image_url ?? mock?.imageUrl ?? DEFAULT_CATEGORY_IMAGE,
    categorySlugs: [category.slug],
    subFilters: mock?.subFilters ?? [{ id: 'all', label: 'Toate' }],
  }
}

/** DB categories for the Products grid; mock sections when empty or unavailable. */
export function resolveProductCatalogSections(categories: CategoryRow[]): ProductCatalogSection[] {
  const active = categories.filter((category) => category.is_active !== false)
  if (active.length > 0) {
    return active.map(mapCategoryRowToCatalogSection)
  }
  return PRODUCT_CATALOG_SECTIONS
}

export function findProductCatalogSection(
  slug: string | undefined,
  categories: CategoryRow[],
): ProductCatalogSection | null {
  if (!slug) return null
  const fromDb = categories.find((category) => category.slug === slug)
  if (fromDb) return mapCategoryRowToCatalogSection(fromDb)
  return getProductCatalogSection(slug)
}

export function isProductCatalogSectionSlug(
  slug: string | undefined,
  categories: CategoryRow[] = [],
): slug is ProductCatalogSectionSlug {
  if (!slug) return false
  if (categories.some((category) => category.slug === slug)) return true
  return PRODUCT_CATALOG_SECTIONS.some((section) => section.slug === slug)
}
