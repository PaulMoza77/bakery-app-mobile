import { uploadImageFromUri } from '@/lib/supabase/storage'

export interface BrandingImagePick {
  uri: string
  mimeType: string
}

export async function uploadBrandingAsset(
  image: BrandingImagePick,
  pathPrefix: 'logo' | 'favicon',
): Promise<string> {
  return uploadImageFromUri(
    'branding-assets',
    image.uri,
    image.mimeType,
    pathPrefix,
  )
}
