import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { useAppTheme } from '@/contexts/BrandingContext'
import {
  uploadBrandingAsset,
  type BrandingImagePick,
} from '@/lib/branding/upload-branding-asset'

interface BrandingImageFieldProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  pathPrefix: 'logo' | 'favicon'
  hint?: string
}

export function BrandingImageField({
  label,
  value,
  onChange,
  pathPrefix,
  hint,
}: BrandingImageFieldProps) {
  const theme = useAppTheme()
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const previewUri = localPreview ?? value

  async function pickAndUpload() {
    setError(null)
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setError('Permisiunea pentru galerie este necesară.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    })
    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    const pick: BrandingImagePick = {
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/png',
    }
    setLocalPreview(asset.uri)
    setUploading(true)
    try {
      const url = await uploadBrandingAsset(pick, pathPrefix)
      onChange(url)
      setLocalPreview(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Încărcare eșuată')
      setLocalPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.brown }]}>{label}</Text>
      {hint ? (
        <Text style={[styles.hint, { color: theme.colors.brownMuted }]}>{hint}</Text>
      ) : null}
      <View
        style={[
          styles.previewBox,
          { backgroundColor: theme.colors.warm, borderColor: theme.colors.border },
        ]}
      >
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.preview} contentFit="contain" />
        ) : (
          <Text style={{ color: theme.colors.brownMuted, fontSize: 13 }}>Fără imagine</Text>
        )}
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={theme.colors.accent} />
          </View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Button
          title={previewUri ? 'Schimbă' : 'Încarcă'}
          variant="secondary"
          onPress={() => void pickAndUpload()}
          loading={uploading}
          disabled={uploading}
        />
        {previewUri ? (
          <Button title="Elimină" variant="ghost" onPress={() => onChange(null)} />
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontWeight: '600', marginBottom: 4, fontSize: 14 },
  hint: { fontSize: 12, marginBottom: 8, lineHeight: 16 },
  previewBox: {
    height: 96,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { color: '#B42318', fontSize: 12, marginTop: 6 },
  actions: { gap: 8, marginTop: 10 },
})
