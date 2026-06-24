export type AtelierProductType = 'event' | 'workshop' | 'recipe'

export type AtelierPurchaseStatus = 'paid' | 'pending' | 'failed'

export interface AtelierProduct {
  id: string
  type: AtelierProductType
  titleRo: string
  titleEn: string | null
  slug: string
  shortDescriptionRo: string | null
  descriptionRo: string | null
  imageUrl: string | null
  galleryImages: string[]
  price: number
  currency: string
  isActive: boolean
  isFeatured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  // Event
  eventDate: string | null
  eventTime: string | null
  locationName: string | null
  locationAddress: string | null
  seatsTotal: number | null
  seatsAvailable: number | null
  hostName: string | null
  includedItems: string[]
  // Workshop
  videoUrl: string | null
  durationMinutes: number | null
  presenterName: string | null
  difficulty: string | null
  whatYouLearn: string[]
  includedMaterials: string[]
  workshopCategory: string | null
  // Recipe
  pdfUrl: string | null
  recipeVideoUrl: string | null
  preparationTimeMinutes: number | null
  ingredientsPreview: string | null
  fullContentLocked: boolean
  allergens: string[]
}

export interface AtelierEntitlement {
  id: string
  userId: string
  productId: string
  productType: AtelierProductType
  purchaseStatus: AtelierPurchaseStatus
  accessGranted: boolean
  purchasedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AtelierEntitlementWithProduct extends AtelierEntitlement {
  product: AtelierProduct
}

export type AtelierCategorySlug = 'evenimente' | 'ateliere-online' | 'retete'

export const ATELIER_CATEGORY_META: Record<
  AtelierCategorySlug,
  { title: string; subtitle: string; type: AtelierProductType; imageUrl: string }
> = {
  evenimente: {
    title: 'Evenimente',
    subtitle: 'Ateliere live și experiențe în laborator',
    type: 'event',
    imageUrl:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
  },
  'ateliere-online': {
    title: 'Ateliere Online',
    subtitle: 'Workshop-uri video — acces permanent',
    type: 'workshop',
    imageUrl:
      'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80',
  },
  retete: {
    title: 'Rețete',
    subtitle: 'PDF și video — rețete de la patiserii noștri',
    type: 'recipe',
    imageUrl:
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
  },
}

export function categorySlugForType(type: AtelierProductType): AtelierCategorySlug {
  if (type === 'event') return 'evenimente'
  if (type === 'workshop') return 'ateliere-online'
  return 'retete'
}

export function typeForCategorySlug(slug: string): AtelierProductType | null {
  const entry = ATELIER_CATEGORY_META[slug as AtelierCategorySlug]
  return entry?.type ?? null
}

export function recipeContentLabel(product: AtelierProduct): string {
  const hasPdf = Boolean(product.pdfUrl)
  const hasVideo = Boolean(product.recipeVideoUrl)
  if (hasPdf && hasVideo) return 'PDF + Video'
  if (hasVideo) return 'Video'
  if (hasPdf) return 'PDF'
  return 'Digital'
}
