import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'
import type { ProductWithCategory } from '@/types/database'
import { getCategoryName } from '@/lib/database/mappers'

interface ProductCardProps {
  product: ProductWithCategory
  onPress: () => void
}

export function ProductCard({ product, onPress }: ProductCardProps) {
  const category = getCategoryName(product)

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🥐</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        {category ? <Text style={styles.category}>{category}</Text> : null}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  pressed: { opacity: 0.9 },
  imageWrap: { aspectRatio: 1, backgroundColor: colors.warm },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 32 },
  body: { padding: 10 },
  category: { fontSize: 11, color: colors.accent, fontWeight: '600', textTransform: 'uppercase' },
  name: { fontSize: 15, fontWeight: '600', color: colors.brown, marginTop: 2 },
  price: { fontSize: 15, fontWeight: '700', color: colors.brown, marginTop: 4 },
})
