import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { CakeCustomizerOption } from '@/lib/cake-customizer/types'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

interface CakeOptionCardProps {
  option: CakeCustomizerOption
  selected: boolean
  onPress: () => void
  showBasePrice?: boolean
  compact?: boolean
}

export function CakeOptionCard({
  option,
  selected,
  onPress,
  showBasePrice = false,
  compact = false,
}: CakeOptionCardProps) {
  const extra = showBasePrice ? option.basePrice : option.extraPrice
  const showPrice = extra != null && extra > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact && styles.cardCompact,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {option.type === 'color' && option.swatchColor ? (
        <View style={[styles.swatch, { backgroundColor: option.swatchColor }]}>
          <Image source={{ uri: option.imageUrl }} style={styles.image} contentFit="cover" />
        </View>
      ) : (
        <Image source={{ uri: option.imageUrl }} style={styles.image} contentFit="cover" />
      )}

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {option.nameRo}
        </Text>
        <Text style={styles.desc} numberOfLines={compact ? 2 : 3}>
          {option.descriptionRo}
        </Text>
        {showPrice ? (
          <Text style={styles.price}>+{formatPrice(extra!)}</Text>
        ) : selected ? (
          <Text style={styles.included}>Inclus</Text>
        ) : null}
      </View>

      {selected ? (
        <View style={styles.check}>
          <Text style={styles.checkMark}>✓</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    overflow: 'hidden',
    marginBottom: 12,
  },
  cardCompact: { marginBottom: 10 },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: '#FFF8F5',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.warm,
  },
  swatch: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 14 },
  name: { fontSize: 17, fontWeight: '700', color: colors.brown },
  desc: {
    fontSize: 13,
    color: colors.brownMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    marginTop: 8,
  },
  included: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
    marginTop: 8,
  },
  check: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: colors.white, fontWeight: '800', fontSize: 14 },
})
