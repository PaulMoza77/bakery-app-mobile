import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { AtelierProduct } from '@/lib/atelier/types'
import { formatPrice } from '@/lib/format/currency'
import { formatEventDateTime } from '@/lib/atelier/format'
import { colors } from '@/theme/colors'

interface AtelierProductCardProps {
  product: AtelierProduct
  hasAccess?: boolean
  onPress: () => void
}

export function AtelierProductCard({ product, hasAccess = false, onPress }: AtelierProductCardProps) {
  const locked = product.type !== 'event' && !hasAccess

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.imageWrap}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder} />
        )}
        {locked ? (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color={colors.white} />
            <Text style={styles.lockText}>Blocat</Text>
          </View>
        ) : hasAccess && product.type !== 'event' ? (
          <View style={[styles.lockBadge, styles.unlockedBadge]}>
            <Ionicons name="checkmark-circle" size={14} color={colors.white} />
            <Text style={styles.lockText}>Deblocat</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        {product.type === 'workshop' && product.workshopCategory ? (
          <Text style={styles.meta}>{product.workshopCategory}</Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {product.titleRo}
        </Text>

        {product.type === 'event' ? (
          <>
            <Text style={styles.detail}>{formatEventDateTime(product)}</Text>
            {product.locationName ? (
              <Text style={styles.detail} numberOfLines={1}>
                {product.locationName}
              </Text>
            ) : null}
            {product.seatsAvailable != null ? (
              <Text style={styles.detail}>{product.seatsAvailable} locuri disponibile</Text>
            ) : null}
          </>
        ) : null}

        {product.type === 'workshop' ? (
          <>
            {product.durationMinutes ? (
              <Text style={styles.detail}>{product.durationMinutes} min</Text>
            ) : null}
            {product.presenterName ? (
              <Text style={styles.detail}>{product.presenterName}</Text>
            ) : null}
          </>
        ) : null}

        {product.type === 'recipe' ? (
          <>
            {product.difficulty ? (
              <Text style={styles.detail}>Dificultate: {product.difficulty}</Text>
            ) : null}
            {product.preparationTimeMinutes ? (
              <Text style={styles.detail}>{product.preparationTimeMinutes} min pregătire</Text>
            ) : null}
          </>
        ) : null}

        {product.shortDescriptionRo ? (
          <Text style={styles.desc} numberOfLines={2}>
            {product.shortDescriptionRo}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          <Text style={styles.cta}>
            {product.type === 'event' ? 'Vezi detalii' : locked ? 'Previzualizare' : 'Deschide'}
          </Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  pressed: { opacity: 0.92 },
  imageWrap: { height: 168, backgroundColor: colors.warm },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, backgroundColor: colors.warm },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  unlockedBadge: { backgroundColor: 'rgba(34,120,70,0.85)' },
  lockText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  body: { padding: 14 },
  meta: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: { fontSize: 17, fontWeight: '700', color: colors.brown, lineHeight: 22 },
  detail: { fontSize: 13, color: colors.brownMuted, marginTop: 4 },
  desc: { fontSize: 13, color: colors.brownMuted, marginTop: 8, lineHeight: 18 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  price: { fontSize: 16, fontWeight: '800', color: colors.brown },
  cta: { fontSize: 13, fontWeight: '700', color: colors.accent },
})
