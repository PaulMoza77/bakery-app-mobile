import * as Crypto from 'expo-crypto'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

export type StorageBucket =
  | 'product-images'
  | 'workshop-images'
  | 'branding-assets'

export async function uploadImageFromUri(
  bucket: StorageBucket,
  uri: string,
  mimeType: string,
  pathPrefix: string,
): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase nu este configurat.')
  }

  const ext = mimeType.split('/')[1]?.toLowerCase() || 'jpg'
  const path = `${pathPrefix}/${Crypto.randomUUID()}.${ext}`

  const response = await fetch(uri)
  const blob = await response.blob()

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: mimeType,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
