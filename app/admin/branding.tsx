import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { BrandingImageField } from '@/components/branding/BrandingImageField'
import { BrandingPreview } from '@/components/branding/BrandingPreview'
import { ColorField } from '@/components/branding/ColorField'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Screen } from '@/components/ui/Screen'
import { useAppTheme } from '@/contexts/BrandingContext'
import { useAdminBranding } from '@/hooks/use-admin-branding'
import {
  BRANDING_FONT_OPTIONS,
  BRANDING_RADIUS_OPTIONS,
} from '@/lib/branding/defaults'

function ChipSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  const theme = useAppTheme()
  return (
    <View style={styles.chipSection}>
      <Text style={[styles.sectionLabel, { color: theme.colors.brown }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((opt) => {
          const active = opt.value === value
          return (
            <Pressable key={opt.value} onPress={() => onChange(opt.value)}>
              <Text
                style={[
                  styles.chip,
                  {
                    borderColor: active ? theme.colors.accent : theme.colors.border,
                    backgroundColor: active ? '#FFF5F2' : theme.colors.surface,
                    color: active ? theme.colors.accent : theme.colors.brown,
                  },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

export default function AdminBrandingScreen() {
  const theme = useAppTheme()
  const {
    form,
    loading,
    error,
    configured,
    saving,
    saveMessage,
    isDirty,
    setField,
    save,
    reset,
    discardDraft,
  } = useAdminBranding()

  if (loading) {
    return (
      <Screen scroll={false}>
        <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  return (
    <Screen>
      <Text style={[styles.intro, { color: theme.colors.brownMuted }]}>
        Personalizează numele, culorile, fonturile și logo-ul aplicației. Modificările se aplică
        imediat după salvare.
      </Text>

      {!configured ? (
        <Text style={[styles.banner, { color: theme.colors.brown }]}>
          Mod local — setările se salvează pe dispozitiv până la conectarea Supabase.
        </Text>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saveMessage ? (
        <Text
          style={[
            styles.status,
            {
              color: saveMessage.includes('salvat') || saveMessage.includes('resetat')
                ? theme.colors.success
                : theme.colors.danger,
            },
          ]}
        >
          {saveMessage}
        </Text>
      ) : null}

      <BrandingPreview form={form} />

      <Card>
        <Text style={[styles.cardTitle, { color: theme.colors.brown }]}>Identitate</Text>
        <Text style={[styles.fieldLabel, { color: theme.colors.brown }]}>Nume aplicație</Text>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.brown,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
          value={form.app_name}
          onChangeText={(v) => setField('app_name', v)}
        />
        <BrandingImageField
          label="Logo"
          pathPrefix="logo"
          value={form.logo_url}
          onChange={(url) => setField('logo_url', url)}
        />
        <BrandingImageField
          label="Icon brand (app icon asset)"
          pathPrefix="favicon"
          value={form.favicon_url}
          onChange={(url) => setField('favicon_url', url)}
          hint="Salvat în cloud; iconul din App Store se schimbă separat la build."
        />
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={[styles.cardTitle, { color: theme.colors.brown }]}>Culori</Text>
        <ColorField
          label="Primary"
          value={form.primary_color}
          onChange={(v) => setField('primary_color', v)}
        />
        <ColorField
          label="Secondary"
          value={form.secondary_color}
          onChange={(v) => setField('secondary_color', v)}
        />
        <ColorField
          label="Accent"
          value={form.accent_color}
          onChange={(v) => setField('accent_color', v)}
        />
        <ColorField
          label="Background"
          value={form.background_color}
          onChange={(v) => setField('background_color', v)}
        />
        <ColorField
          label="Surface / card"
          value={form.surface_color}
          onChange={(v) => setField('surface_color', v)}
        />
        <ColorField
          label="Text"
          value={form.text_color}
          onChange={(v) => setField('text_color', v)}
        />
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={[styles.cardTitle, { color: theme.colors.brown }]}>Tipografie & forme</Text>
        <ChipSelect
          label="Font titluri"
          value={form.heading_font}
          options={BRANDING_FONT_OPTIONS}
          onChange={(v) => setField('heading_font', v)}
        />
        <ChipSelect
          label="Font corp"
          value={form.body_font}
          options={BRANDING_FONT_OPTIONS}
          onChange={(v) => setField('body_font', v)}
        />
        <ChipSelect
          label="Rază butoane"
          value={form.button_radius}
          options={BRANDING_RADIUS_OPTIONS}
          onChange={(v) => setField('button_radius', v)}
        />
        <ChipSelect
          label="Rază carduri"
          value={form.card_radius}
          options={BRANDING_RADIUS_OPTIONS}
          onChange={(v) => setField('card_radius', v)}
        />
      </Card>

      <View style={styles.actions}>
        <Button title="Salvează" onPress={() => void save()} loading={saving} disabled={!isDirty} />
        <Button
          title="Reset la implicit"
          variant="secondary"
          onPress={() => void reset()}
          disabled={saving}
        />
        {isDirty ? (
          <Button title="Renunță" variant="ghost" onPress={discardDraft} disabled={saving} />
        ) : null}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  banner: {
    fontSize: 13,
    marginBottom: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFF9E6',
  },
  error: { color: '#B42318', marginBottom: 8 },
  status: { marginBottom: 12, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  chipSection: { marginBottom: 14 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 12,
    overflow: 'hidden',
  },
  actions: { gap: 10, marginTop: 16, marginBottom: 24 },
})
