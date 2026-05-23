import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { resolveRouteParam } from '@/lib/route-params'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useCart } from '@/contexts/CartContext'
import { useProductDetail } from '@/hooks/use-product-detail'
import { getCategoryName } from '@/lib/database/mappers'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

export default function ProductDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string | string[] }>()
  const productId = resolveRouteParam(idParam)
  const router = useRouter()
  const { addItem } = useCart()
  const { product, liveDrops, loading, error, configured, notFound, refetch } =
    useProductDetail(productId)

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  if (error && !product) {
    return (
      <Screen>
        {!configured && <SupabaseNotice />}
        <EmptyState title="Eroare la încărcare" description={error} />
        <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        <Button title="Înapoi" variant="ghost" onPress={() => router.back()} />
      </Screen>
    )
  }

  if (notFound || !product) {
    return (
      <Screen>
        <EmptyState title="Produs negăsit" description="Acest produs nu este disponibil." />
        <Button title="Înapoi" variant="secondary" onPress={() => router.back()} />
      </Screen>
    )
  }

  const activeDrop = liveDrops.find((d) => d.phase === 'live')
  const dropId = activeDrop?.id ?? null
  const maxQty = activeDrop
    ? activeDrop.quantity_available - activeDrop.quantity_sold
    : undefined

  const p = product

  function handleAdd() {
    addItem({
      productId: p.id,
      name: p.name,
      unitPriceCents: p.price,
      imageUrl: p.image_url,
      dropId,
      maxQuantity: maxQty,
    })
    router.push('/cart')
  }

  const category = getCategoryName(p)

  return (
    <Screen>
      {!configured && <SupabaseNotice />}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.imageWrap}>
        {p.image_url ? (
          <Image source={{ uri: p.image_url }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ fontSize: 48 }}>🥐</Text>
          </View>
        )}
      </View>
      {category ? <Text style={styles.category}>{category}</Text> : null}
      <Text style={styles.name}>{p.name}</Text>
      <Text style={styles.price}>{formatPrice(p.price)}</Text>
      {p.description ? (
        <Text style={styles.desc}>{p.description}</Text>
      ) : null}
      {activeDrop && (
        <Card style={styles.dropCard}>
          <Text style={styles.dropLabel}>DROP LIVE — stoc limitat</Text>
          <Text style={styles.dropStock}>
            {maxQty != null ? `${maxQty} bucăți rămase` : ''}
          </Text>
        </Card>
      )}
      <Button
        title="Adaugă în coș"
        onPress={handleAdd}
        disabled={activeDrop != null && maxQty != null && maxQty <= 0}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  imageWrap: {
    aspectRatio: 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.warm,
    marginBottom: 12,
  },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  category: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  name: { fontSize: 24, fontWeight: '700', color: colors.brown, marginTop: 4 },
  price: { fontSize: 20, fontWeight: '700', color: colors.brown, marginTop: 8 },
  desc: { fontSize: 15, color: colors.brownMuted, marginTop: 12, lineHeight: 22 },
  dropCard: { marginVertical: 12, backgroundColor: '#FFF5F2' },
  dropLabel: { fontWeight: '700', color: colors.accent },
  dropStock: { marginTop: 4, color: colors.brownMuted },
  error: { color: colors.danger, marginBottom: 8 },
})
