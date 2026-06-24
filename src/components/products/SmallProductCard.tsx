import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatPrice } from '@/lib/format/currency'
import type { ProductPreview } from '@/lib/products/featured-products'
import { colors } from '@/theme/colors'

interface SmallProductCardProps {
  product: ProductPreview
  onPress: () => void
}

export function SmallProductCard({ product, onPress }: SmallProductCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View style={styles.imageWrap}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🥐</Text>
          </View>
        )}
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
    </Pressable>
  )
}

const CARD_WIDTH = 132

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    shadowColor: colors.brown,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: { opacity: 0.92 },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.warm,
    marginBottom: 8,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderEmoji: { fontSize: 28 },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brown,
    lineHeight: 17,
    minHeight: 34,
  },
  price: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: colors.brown,
  },
})
