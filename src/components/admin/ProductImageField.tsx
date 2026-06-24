import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import {
  uploadProductImage,
  type ProductImagePick,
} from '@/lib/products/upload-product-image'
import { colors } from '@/theme/colors'

interface ProductImageFieldProps {
  value: string | null
  onChange: (url: string | null) => void
  productId?: string
  onUploadingChange?: (uploading: boolean) => void
}

export function ProductImageField({
  value,
  onChange,
  productId,
  onUploadingChange,
}: ProductImageFieldProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewUri = localPreview ?? value

  async function setUploadingState(next: boolean) {
    setUploading(next)
    onUploadingChange?.(next)
  }

  async function pickAndUpload() {
    setError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Permisiunea pentru galerie este necesară.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    const pick: ProductImagePick = {
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
    }
    setLocalPreview(asset.uri)

    await setUploadingState(true)
    try {
      const publicUrl = await uploadProductImage(pick, productId)
      onChange(publicUrl)
      setLocalPreview(null)
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Încărcarea imaginii a eșuat.'
      setError(message)
      setLocalPreview(null)
    } finally {
      await setUploadingState(false)
    }
  }

  function clearImage() {
    setError(null)
    setLocalPreview(null)
    onChange(null)
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Imagine produs</Text>
      <View style={styles.previewBox}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Fără imagine</Text>
          </View>
        )}
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.white} />
            <Text style={styles.overlayText}>Se încarcă…</Text>
          </View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button
          title={previewUri ? 'Schimbă imaginea' : 'Încarcă din galerie'}
          variant="secondary"
          onPress={() => void pickAndUpload()}
          loading={uploading}
          disabled={uploading}
        />
        {previewUri ? (
          <Button
            title="Elimină imaginea"
            variant="ghost"
            onPress={clearImage}
            disabled={uploading}
          />
        ) : null}
      </View>
      {!previewUri && !uploading ? (
        <Text style={styles.hint}>Alege o fotografie înainte de salvare.</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontWeight: '600', marginBottom: 8, color: colors.brown },
  previewBox: {
    aspectRatio: 1.4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { color: colors.brownMuted, fontSize: 14 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  overlayText: { color: colors.white, fontWeight: '600' },
  error: { color: colors.danger, marginTop: 8, fontSize: 13 },
  actions: { gap: 8, marginTop: 10 },
  hint: { fontSize: 12, color: colors.brownMuted, marginTop: 6 },
})
