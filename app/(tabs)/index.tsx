import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { ProductHorizontalSection } from '@/components/products/ProductHorizontalSection'
import { ProductSectionCard } from '@/components/products/ProductSectionCard'
import { AtelierePromoCard } from '@/components/atelier/AtelierePromoCard'
import { Card } from '@/components/ui/Card'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useProductFeaturedSections } from '@/hooks/use-product-featured-sections'
import { useProductsCatalog } from '@/hooks/use-products-catalog'
import { formatCountdownDisplay, getCountdownParts } from '@/lib/drops'
import { colors } from '@/theme/colors'

export default function ProductsTab() {
  const router = useRouter()
  const {
    primaryDrop,
    catalogSections,
    popularFromDb,
    restockedFromDb,
    allProducts,
    liveDrops,
    featuredDbOk,
    loading,
    configured,
  } = useProductsCatalog()
  const { popularProducts, restockedProducts } = useProductFeaturedSections(
    allProducts,
    popularFromDb,
    restockedFromDb,
    liveDrops,
    featuredDbOk,
  )

  function openProduct(productId: string) {
    if (productId.startsWith('mock-')) return
    router.push(`/product/${productId}`)
  }

  return (
    <Screen compactTop>
      <Card variant="hero" style={styles.hero}>
        <Text style={styles.heroTitle}>Proaspăt din laborator</Text>
        <Text style={styles.heroSub}>
          Alege o categorie și descoperă produsele noastre.
        </Text>
      </Card>

      {!configured && <SupabaseNotice />}

      <AtelierePromoCard />

      {!loading && primaryDrop && primaryDrop.phase === 'live' && (
        <Pressable
          style={styles.dropBanner}
          onPress={() => router.push(`/product/${primaryDrop.product.id}`)}
        >
          <Text style={styles.dropLabel}>DROP LIVE</Text>
          <Text style={styles.dropName}>{primaryDrop.product.name}</Text>
          <Text style={styles.dropCountdown}>
            {(() => {
              const parts = getCountdownParts(primaryDrop.countdownTarget)
              return parts ? formatCountdownDisplay(parts) : '—'
            })()}
          </Text>
        </Pressable>
      )}

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <>
          <View style={styles.grid}>
            {catalogSections.map((section) => (
              <View key={section.slug} style={styles.gridItem}>
                <ProductSectionCard section={section} />
              </View>
            ))}
          </View>

          <ProductHorizontalSection
            title="Produse Populare"
            products={popularProducts}
            onProductPress={openProduct}
          />

          <ProductHorizontalSection
            title="Produse revenite în stoc"
            products={restockedProducts}
            onProductPress={openProduct}
          />
        </>
      )}
    </Screen>
  )
}

const HERO_BROWN = '#9A7B63'

const styles = StyleSheet.create({
  hero: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: HERO_BROWN,
    borderColor: HERO_BROWN,
  },
  heroTitle: { color: colors.white, fontSize: 20, fontWeight: '700' },
  heroSub: { color: '#F3EBE0', fontSize: 13, marginTop: 4, lineHeight: 18 },
  dropBanner: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  dropLabel: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  dropName: { color: colors.white, fontSize: 18, fontWeight: '700', marginTop: 4 },
  dropCountdown: { color: '#FFE8E0', fontSize: 14, marginTop: 4 },
  loader: { marginTop: 32 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItem: {
    width: '48%',
  },
})
