import type { AtelierEntitlement, AtelierProduct } from '@/lib/atelier/types'
import type { AtelierEntitlementRow, AtelierProductRow } from '@/types/database'

export function mapAtelierProduct(row: AtelierProductRow): AtelierProduct {
  return {
    id: row.id,
    type: row.type,
    titleRo: row.title_ro,
    titleEn: row.title_en,
    slug: row.slug,
    shortDescriptionRo: row.short_description_ro,
    descriptionRo: row.description_ro,
    imageUrl: row.image_url,
    galleryImages: Array.isArray(row.gallery_images)
      ? (row.gallery_images as string[])
      : [],
    price: row.price,
    currency: row.currency,
    isActive: row.is_active,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    eventDate: row.event_date,
    eventTime: row.event_time,
    locationName: row.location_name,
    locationAddress: row.location_address,
    seatsTotal: row.seats_total,
    seatsAvailable: row.seats_available,
    hostName: row.host_name,
    includedItems: row.included_items ?? [],
    videoUrl: row.video_url,
    durationMinutes: row.duration_minutes,
    presenterName: row.presenter_name,
    difficulty: row.difficulty,
    whatYouLearn: row.what_you_learn ?? [],
    includedMaterials: row.included_materials ?? [],
    workshopCategory: row.workshop_category,
    pdfUrl: row.pdf_url,
    recipeVideoUrl: row.recipe_video_url,
    preparationTimeMinutes: row.preparation_time_minutes,
    ingredientsPreview: row.ingredients_preview,
    fullContentLocked: row.full_content_locked,
    allergens: row.allergens ?? [],
  }
}

export function mapAtelierEntitlement(row: AtelierEntitlementRow): AtelierEntitlement {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    productType: row.product_type,
    purchaseStatus: row.purchase_status,
    accessGranted: row.access_granted,
    purchasedAt: row.purchased_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
