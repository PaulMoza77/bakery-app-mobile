import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAdminOrders } from '@/hooks/use-admin-orders'
import { formatPrice } from '@/lib/format/currency'
import { formatOrderDateTime } from '@/lib/format/date'
import type { OrderStatus } from '@/types/database'
import { colors } from '@/theme/colors'

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
]

export default function AdminOrdersScreen() {
  const { orders, loading, error, setStatus, saving } = useAdminOrders()

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return (
    <View style={styles.flex}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {orders.map((order) => (
        <View key={order.id} style={styles.card}>
          <Text style={styles.client}>
            {order.client_name ?? order.client_email ?? 'Client'}
          </Text>
          <Text style={styles.meta}>
            {formatOrderDateTime(order.created_at)} · {formatPrice(order.total_amount)}
          </Text>
          <Text style={styles.status}>Status: {order.status}</Text>
          <View style={styles.statusRow}>
            {STATUSES.map((s) => (
              <Pressable
                key={s}
                style={[styles.chip, order.status === s && styles.chipOn]}
                onPress={() => void setStatus(order.id, s)}
                disabled={saving}
              >
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  client: { fontWeight: '700', fontSize: 16, color: colors.brown },
  meta: { fontSize: 13, color: colors.brownMuted, marginTop: 4 },
  status: { marginTop: 8, fontWeight: '600', color: colors.accent },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.warm,
  },
  chipOn: { backgroundColor: colors.accent },
  chipText: { fontSize: 11, color: colors.brown },
  error: { color: colors.danger, marginBottom: 8 },
})
