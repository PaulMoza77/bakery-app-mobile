import { Pressable, ScrollView, StyleSheet, Text } from 'react-native'
import type { ProductSectionSubFilter } from '@/lib/products/catalog-sections'
import { colors } from '@/theme/colors'

interface ProductFilterChipsProps {
  filters: ProductSectionSubFilter[]
  activeId: string
  onChange: (id: string) => void
}

export function ProductFilterChips({ filters, activeId, onChange }: ProductFilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {filters.map((filter) => {
        const active = filter.id === activeId
        return (
          <Pressable
            key={filter.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => onChange(filter.id)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{filter.label}</Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.brown },
  chipTextActive: { color: colors.white },
})
