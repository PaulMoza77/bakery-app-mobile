import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SmallProductCard } from '@/components/products/SmallProductCard'
import type { ProductPreview } from '@/lib/products/featured-products'
import { colors } from '@/theme/colors'

interface ProductHorizontalSectionProps {
  title: string
  products: ProductPreview[]
  onProductPress: (productId: string) => void
}

export function ProductHorizontalSection({
  title,
  products,
  onProductPress,
}: ProductHorizontalSectionProps) {
  if (products.length === 0) return null

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {products.map((product) => (
          <SmallProductCard
            key={product.id}
            product={product}
            onPress={() => onProductPress(product.id)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brown,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 4,
  },
})
