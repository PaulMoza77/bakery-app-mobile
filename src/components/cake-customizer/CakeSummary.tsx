import { StyleSheet, Text, View } from 'react-native'
import { CakePreview } from '@/components/cake-customizer/CakePreview'
import { Card } from '@/components/ui/Card'
import type {
  CakeCustomizerCatalog,
  CakeCustomizationState,
  CakePriceBreakdown,
} from '@/lib/cake-customizer/types'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

interface CakeSummaryProps {
  state: CakeCustomizationState
  catalog: CakeCustomizerCatalog
  price: CakePriceBreakdown
}

function labelFor(
  list: { id: string; nameRo: string }[],
  id: string | null | undefined,
): string {
  if (!id) return '—'
  return list.find((item) => item.id === id)?.nameRo ?? '—'
}

export function CakeSummary({ state, catalog, price }: CakeSummaryProps) {
  const tierLabel =
    state.tiers === 1
      ? '1 etaj'
      : state.tiers === 2
        ? '2 etaje'
        : state.tiers === 3
          ? '3 etaje'
          : '—'

  const rows: { label: string; value: string }[] = [
    {
      label: 'Persoane',
      value: labelFor(catalog.persons, state.personsOptionId),
    },
    { label: 'Etaje', value: tierLabel },
    { label: 'Blat', value: labelFor(catalog.sponges, state.spongeId) },
    { label: 'Cremă', value: labelFor(catalog.creams, state.creamId) },
    { label: 'Finisaj', value: labelFor(catalog.glazes, state.glazeId) },
  ]

  if (state.themeId) {
    rows.push({ label: 'Temă', value: labelFor(catalog.themes, state.themeId) })
  }
  if (state.color) {
    rows.push({ label: 'Culoare', value: labelFor(catalog.colors, state.color) })
  }
  if (state.customText?.trim()) {
    rows.push({ label: 'Text pe tort', value: `"${state.customText.trim()}"` })
  }
  if (state.uploadedInspirationImage) {
    rows.push({ label: 'Inspirație foto', value: 'Imagine atașată' })
  }
  if (state.notes?.trim()) {
    rows.push({ label: 'Observații', value: state.notes.trim() })
  }

  return (
    <View style={styles.wrap}>
      {state.tiers ? (
        <View style={styles.previewBlock}>
          <CakePreview tiers={state.tiers} />
        </View>
      ) : null}

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Alegerile tale</Text>
        {rows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Preț estimativ</Text>
        {price.lines.map((line) => (
          <View key={line.label} style={styles.priceRow}>
            <Text style={styles.priceLabel}>{line.label}</Text>
            <Text style={styles.priceValue}>{formatPrice(line.amountCents)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(price.totalCents)}</Text>
        </View>
        <Text style={styles.disclaimer}>
          Preț orientativ. Confirmarea finală vine de la patiserie după trimiterea cererii.
        </Text>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  previewBlock: { marginBottom: 4 },
  card: { marginBottom: 0 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.brown,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: 14, color: colors.brownMuted, flex: 1 },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brown,
    flex: 1,
    textAlign: 'right',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14, color: colors.brownMuted },
  priceValue: { fontSize: 14, fontWeight: '600', color: colors.brown },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: colors.brown },
  totalValue: { fontSize: 22, fontWeight: '800', color: colors.accent },
  disclaimer: {
    fontSize: 12,
    color: colors.brownMuted,
    marginTop: 12,
    lineHeight: 17,
  },
})
