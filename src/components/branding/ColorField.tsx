import { StyleSheet, Text, TextInput, View } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'

interface ColorFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function normalizeHex(value: string): string {
  const v = value.trim()
  if (!v.startsWith('#')) return `#${v}`
  return v
}

export function ColorField({ label, value, onChange }: ColorFieldProps) {
  const theme = useAppTheme()
  const swatchColor = /^#[0-9A-Fa-f]{6}$/.test(value) ? value : theme.colors.border

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.brown }]}>{label}</Text>
      <View style={styles.row}>
        <View style={[styles.swatch, { backgroundColor: swatchColor, borderColor: theme.colors.border }]} />
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.brown,
              borderColor: theme.colors.border,
              backgroundColor: theme.colors.surface,
            },
          ]}
          value={value}
          onChangeText={(t) => onChange(normalizeHex(t))}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="#RRGGBB"
          placeholderTextColor={theme.colors.brownMuted}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: { width: 44, height: 44, borderRadius: 10, borderWidth: 1 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'monospace',
  },
})
