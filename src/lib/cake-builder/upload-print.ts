import { uploadImageFromUri } from '@/lib/supabase/storage'

export interface CakePrintImage {
  uri: string
  mimeType: string
}

export async function uploadCakePrintImage(
  image: CakePrintImage,
  userId: string,
): Promise<string> {
  return uploadImageFromUri(
    'product-images',
    image.uri,
    image.mimeType,
    `cake-prints/${userId}`,
  )
}
