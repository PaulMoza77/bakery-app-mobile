import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { AtelierProductCard } from '@/components/atelier/AtelierProductCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useAtelierProducts } from '@/hooks/use-atelier-products'
import { useAtelierAccessMap } from '@/hooks/use-atelier-access-map'
import { resolveRouteParam } from '@/lib/route-params'
import {
  ATELIER_CATEGORY_META,
  type AtelierCategorySlug,
  typeForCategorySlug,
} from '@/lib/atelier/types'
import { colors } from '@/theme/colors'

export default function AtelierCategoryScreen() {
  const router = useRouter()
  const { type: typeParam } = useLocalSearchParams<{ type: string | string[] }>()
  const slug = resolveRouteParam(typeParam) as AtelierCategorySlug | undefined
  const productType = slug ? typeForCategorySlug(slug) : null
  const meta = slug ? ATELIER_CATEGORY_META[slug] : null

  const { user } = useAuth()
  const { products, loading, error, configured, refetch } = useAtelierProducts(
    productType ?? 'event',
  )
  const { accessByProductId } = useAtelierAccessMap(user?.id)

  if (!slug || !productType || !meta) {
    return (
      <Screen>
        <EmptyState title="Secțiune negăsită" description="Categoria nu există." />
        <Button title="Înapoi" variant="secondary" onPress={() => router.back()} />
      </Screen>
    )
  }

  return (
    <Screen>
      {!configured && <SupabaseNotice />}
      <Text style={styles.title}>{meta.title}</Text>
      <Text style={styles.sub}>{meta.subtitle}</Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      ) : error && products.length === 0 ? (
        <>
          <EmptyState title="Eroare" description={error} />
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </>
      ) : products.length === 0 ? (
        <EmptyState
          title="Niciun conținut"
          description="Produsele active vor apărea aici."
        />
      ) : (
        products.map((product) => (
          <AtelierProductCard
            key={product.id}
            product={product}
            hasAccess={accessByProductId.get(product.id) ?? false}
            onPress={() => router.push(`/atelier/product/${product.id}`)}
          />
        ))
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.brown, marginBottom: 6 },
  sub: { fontSize: 14, color: colors.brownMuted, lineHeight: 20, marginBottom: 16 },
})
