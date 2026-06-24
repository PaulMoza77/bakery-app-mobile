import { useLocalSearchParams, useRouter } from 'expo-router'
import { useLayoutEffect } from 'react'
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { ProductCard } from '@/components/products/ProductCard'
import { ProductFilterChips } from '@/components/products/ProductFilterChips'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useProductSectionCatalog } from '@/hooks/use-product-section-catalog'
import { resolveRouteParam } from '@/lib/route-params'
import { colors } from '@/theme/colors'

export default function ProductSectionScreen() {
  const router = useRouter()
  const navigation = useNavigation()
  const { section: sectionParam } = useLocalSearchParams<{ section: string | string[] }>()
  const sectionSlug = resolveRouteParam(sectionParam)

  const {
    section,
    products,
    subFilterId,
    setSubFilterId,
    loading,
    error,
    configured,
    refetch,
  } = useProductSectionCatalog(sectionSlug)

  useLayoutEffect(() => {
    navigation.setOptions({
      title: section?.title ?? 'Produse',
    })
  }, [navigation, section?.title])

  if (!sectionSlug || !section) {
    return (
      <Screen>
        <EmptyState title="Secțiune invalidă" description="Nu am găsit categoria selectată." />
        <Button title="Înapoi" variant="ghost" onPress={() => router.back()} />
      </Screen>
    )
  }

  return (
    <Screen>
      <Card variant="soft" style={styles.hero}>
        <Text style={styles.heroTitle}>{section.title}</Text>
        <Text style={styles.heroSub}>{section.description}</Text>
      </Card>

      {!configured && <SupabaseNotice />}

      <ProductFilterChips
        filters={section.subFilters}
        activeId={subFilterId}
        onChange={setSubFilterId}
      />

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error && products.length === 0 ? (
        <View>
          <EmptyState title="Eroare" description={error} />
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </View>
      ) : products.length === 0 ? (
        <EmptyState
          title="Niciun produs încă"
          description="Produsele pentru această secțiune vor apărea aici după configurare în admin."
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.col}>
              <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
            </View>
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginBottom: 14 },
  heroTitle: { fontSize: 20, fontWeight: '700', color: colors.brown },
  heroSub: { marginTop: 6, fontSize: 14, lineHeight: 20, color: colors.brownMuted },
  loader: { marginTop: 32 },
  row: { gap: 12 },
  col: { flex: 1 },
})
