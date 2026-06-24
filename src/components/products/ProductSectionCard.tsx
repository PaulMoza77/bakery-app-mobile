import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ProductCatalogSection } from '@/lib/products/catalog-sections'
import { colors } from '@/theme/colors'

interface ProductSectionCardProps {
  section: ProductCatalogSection
}

export function ProductSectionCard({ section }: ProductSectionCardProps) {
  const router = useRouter()

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push(`/products/${section.slug}`)}
      accessibilityRole="button"
      accessibilityLabel={section.title}
    >
      <Image source={{ uri: section.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.labelWrap}>
        <Text style={styles.title}>{section.title}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 0.92,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.warm,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.985 }] },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 18, 12, 0.42)',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
})
