import { Image } from 'expo-image'
import { StyleSheet, Text, View } from 'react-native'
import { settingsToTheme } from '@/lib/branding/theme'
import type { AppSettingsUpdate } from '@/lib/branding/types'

interface BrandingPreviewProps {
  form: AppSettingsUpdate
}

export function BrandingPreview({ form }: BrandingPreviewProps) {
  const theme = settingsToTheme({
    id: 'default',
    created_at: '',
    updated_at: '',
    ...form,
  })

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.card,
        },
      ]}
    >
      <Text style={[styles.title, { color: theme.colors.brown, fontFamily: theme.fonts.heading }]}>
        Previzualizare
      </Text>
      <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
        {form.logo_url ? (
          <Image source={{ uri: form.logo_url }} style={styles.logo} contentFit="contain" />
        ) : (
          <View style={[styles.logoPlaceholder, { backgroundColor: theme.colors.warm }]}>
            <Text style={{ color: theme.colors.brownMuted }}>Logo</Text>
          </View>
        )}
        <Text
          style={[
            styles.appName,
            { color: theme.colors.brown, fontFamily: theme.fonts.heading },
          ]}
        >
          {form.app_name}
        </Text>
      </View>
      <Text style={[styles.body, { color: theme.colors.brownMuted, fontFamily: theme.fonts.body }]}>
        Text secundar — descriere produs sau mesaj suport.
      </Text>
      <View
        style={[
          styles.button,
          {
            backgroundColor: theme.colors.accent,
            borderRadius: theme.radii.button,
          },
        ]}
      >
        <Text style={styles.buttonText}>Buton principal</Text>
      </View>
      {form.favicon_url ? (
        <View style={styles.iconRow}>
          <Text style={{ color: theme.colors.brownMuted, fontSize: 12 }}>Icon brand:</Text>
          <Image source={{ uri: form.favicon_url }} style={styles.favicon} contentFit="contain" />
        </View>
      ) : null}
      <Text style={[styles.note, { color: theme.colors.brownMuted }]}>
        După salvare, brandingul se aplică imediat în aplicație.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { padding: 14, borderWidth: 1, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  logo: { width: 40, height: 40 },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 17, fontWeight: '700', flex: 1 },
  body: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  button: { paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  favicon: { width: 28, height: 28 },
  note: { fontSize: 11, marginTop: 12, lineHeight: 16 },
})
