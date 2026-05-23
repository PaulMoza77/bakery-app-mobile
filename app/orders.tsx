import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useMyOrders } from '@/hooks/use-orders'
import { formatPrice } from '@/lib/format/currency'
import { formatOrderDateTime } from '@/lib/format/date'
import { colors } from '@/theme/colors'

export default function OrdersScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    orders,
    customCakes,
    loading,
    error,
    configured,
    cancelOrder,
    cancellingId,
    refetch,
  } = useMyOrders()

  if (!user) {
    return (
      <Screen>
        <EmptyState
          title="Autentificare necesară"
          description="Intră în cont pentru a vedea comenzile."
        />
        <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
      </Screen>
    )
  }

  const isEmpty = orders.length === 0 && customCakes.length === 0

  return (
    <Screen scroll={false} padded={false}>
      {!configured && (
        <View style={styles.notice}>
          <SupabaseNotice />
        </View>
      )}

      {loading && isEmpty ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error && isEmpty ? (
        <View style={styles.padded}>
          <EmptyState title="Eroare la încărcare" description={error} />
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </View>
      ) : (
        <FlatList
          data={[{ key: 'content' }]}
          keyExtractor={(item) => item.key}
          refreshControl={
            <RefreshControl
              refreshing={loading && !isEmpty}
              onRefresh={() => void refetch()}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={styles.list}
          renderItem={() => (
            <>
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Text style={styles.section}>Comenzi produse</Text>
              {orders.length === 0 ? (
                <EmptyState title="Nicio comandă" description="Comenzile tale vor apărea aici." />
              ) : (
                orders.map((order) => (
                  <Card key={order.id} style={styles.card}>
                    <View style={styles.row}>
                      <Text style={styles.status}>{order.status}</Text>
                      <Text style={styles.date}>{formatOrderDateTime(order.created_at)}</Text>
                    </View>
                    <Text style={styles.total}>{formatPrice(order.total_amount)}</Text>
                    {order.order_items.map((item) => (
                      <Text key={item.id} style={styles.item}>
                        {item.products?.name ?? 'Produs'} × {item.quantity}
                      </Text>
                    ))}
                    {order.status === 'pending' && (
                      <Pressable
                        onPress={() => void cancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                      >
                        <Text style={styles.cancel}>
                          {cancellingId === order.id ? 'Se anulează…' : 'Anulează comanda'}
                        </Text>
                      </Pressable>
                    )}
                  </Card>
                ))
              )}

              <Text style={[styles.section, { marginTop: 20 }]}>Torturi personalizate</Text>
              {customCakes.length === 0 ? (
                <EmptyState title="Niciun tort" description="Comenzile de tort apar aici." />
              ) : (
                customCakes.map((cake) => (
                  <Card key={cake.id} style={styles.card}>
                    <Text style={styles.cakeTitle}>
                      {cake.size} — {cake.flavor}
                    </Text>
                    <Text style={styles.status}>{cake.status}</Text>
                    <Text style={styles.total}>{formatPrice(cake.calculated_price)}</Text>
                  </Card>
                ))
              )}
            </>
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  notice: { padding: 16, paddingBottom: 0 },
  padded: { padding: 16 },
  list: { padding: 16, paddingBottom: 32 },
  loader: { marginTop: 32 },
  section: { fontSize: 17, fontWeight: '700', color: colors.brown, marginBottom: 10 },
  card: { marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { fontSize: 13, fontWeight: '600', color: colors.accent, textTransform: 'capitalize' },
  date: { fontSize: 12, color: colors.brownMuted },
  total: { fontSize: 18, fontWeight: '700', color: colors.brown, marginTop: 6 },
  item: { fontSize: 14, color: colors.brownMuted, marginTop: 4 },
  cancel: { marginTop: 10, color: colors.danger, fontWeight: '600' },
  cakeTitle: { fontSize: 16, fontWeight: '600', color: colors.brown },
  error: { color: colors.danger, marginBottom: 12 },
})
