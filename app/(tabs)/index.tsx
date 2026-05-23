import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { ProductCard } from '@/components/products/ProductCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useProductsCatalog } from '@/hooks/use-products-catalog'
import { formatCountdownDisplay, getCountdownParts } from '@/lib/drops'
import { colors } from '@/theme/colors'

export default function ProductsTab() {
  const router = useRouter()
  const {
    products,
    categories,
    primaryDrop,
    loading,
    error,
    configured,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    refetch,
  } = useProductsCatalog()

  return (
    <Screen>
      <Card variant="hero" style={styles.hero}>
        <Text style={styles.heroOverline}>Proaspăt din cuptor</Text>
        <Text style={styles.heroTitle}>Gusturi care îți fac dimineața mai bună</Text>
        <Text style={styles.heroSub}>
          Drop-uri programate cu stoc limitat. Precomandă torturile tale.
        </Text>
      </Card>

      {!configured && <SupabaseNotice />}

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
        <ActivityIndicator color={colors.accent} style={{ marginTop: 32 }} />
      ) : (
        <>
          <Text style={styles.label}>Caută produse</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Caută croissant, tort, ecler…"
            placeholderTextColor={colors.brownMuted}
            style={styles.search}
          />

          <View style={styles.chips}>
            <Pressable
              style={[styles.chip, !categoryId && styles.chipActive]}
              onPress={() => setCategoryId(null)}
            >
              <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>Toate</Text>
            </Pressable>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, categoryId === c.id && styles.chipActive]}
                onPress={() => setCategoryId(c.id)}
              >
                <Text
                  style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}
                >
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {error && products.length === 0 ? (
            <View>
              <EmptyState
                title={
                  !configured ? 'Supabase nu este configurat' : 'Nu am putut încărca produsele'
                }
                description={error}
              />
              <Button
                title="Încearcă din nou"
                variant="secondary"
                onPress={() => void refetch()}
              />
            </View>
          ) : products.length === 0 ? (
            <EmptyState title="Niciun produs" description="Revino curând pentru noutăți." />
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.col}>
                  <ProductCard
                    product={item}
                    onPress={() => router.push(`/product/${item.id}`)}
                  />
                </View>
              )}
            />
          )}
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginBottom: 16 },
  heroOverline: { color: colors.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 22, fontWeight: '700', marginTop: 6 },
  heroSub: { color: '#E8DDD0', fontSize: 14, marginTop: 8, lineHeight: 20 },
  dropBanner: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  dropLabel: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  dropName: { color: colors.white, fontSize: 18, fontWeight: '700', marginTop: 4 },
  dropCountdown: { color: '#FFE8E0', fontSize: 14, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: colors.brown, marginBottom: 6 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    backgroundColor: colors.white,
    marginBottom: 12,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.brown },
  chipTextActive: { color: colors.white, fontWeight: '600' },
  row: { gap: 12 },
  col: { flex: 1 },
})
