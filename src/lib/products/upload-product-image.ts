import { uploadImageFromUri } from '@/lib/supabase/storage'

export interface ProductImagePick {
  uri: string
  mimeType: string
}

export async function uploadProductImage(
  image: ProductImagePick,
  productId?: string,
): Promise<string> {
  const prefix = productId ? `products/${productId}` : 'products/pending'
  return uploadImageFromUri('product-images', image.uri, image.mimeType, prefix)
}
