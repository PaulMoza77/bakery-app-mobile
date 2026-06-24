import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, View } from 'react-native'
import type { AtelierProduct } from '@/lib/atelier/types'
import { recipeContentLabel } from '@/lib/atelier/types'
import { colors } from '@/theme/colors'

interface LockedContentPreviewProps {
  product: AtelierProduct
}

export function LockedContentPreview({ product }: LockedContentPreviewProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="lock-closed" size={28} color={colors.accent} />
      </View>
      <Text style={styles.title}>Conținut blocat</Text>
      <Text style={styles.desc}>
        {product.type === 'workshop'
          ? 'Cumpără accesul pentru a viziona atelierul video complet.'
          : 'Cumpără rețeta pentru a accesa PDF-ul, video-ul și ingredientele complete.'}
      </Text>
      {product.type === 'recipe' ? (
        <Text style={styles.meta}>Format: {recipeContentLabel(product)}</Text>
      ) : null}
      {product.ingredientsPreview ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewLabel}>Previzualizare ingrediente</Text>
          <Text style={styles.previewText}>{product.ingredientsPreview}</Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    padding: 18,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginVertical: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.brown },
  desc: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.brownMuted,
    textAlign: 'center',
  },
  meta: { marginTop: 10, fontSize: 13, fontWeight: '600', color: colors.accent },
  previewBox: {
    width: '100%',
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: colors.warm,
  },
  previewLabel: { fontSize: 12, fontWeight: '700', color: colors.brown, marginBottom: 4 },
  previewText: { fontSize: 13, color: colors.brownMuted, lineHeight: 18 },
})
