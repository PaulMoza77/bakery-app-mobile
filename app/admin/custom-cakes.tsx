import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAdminCakeCatalog } from '@/hooks/use-admin-cake-catalog'
import { formatPrice } from '@/lib/format/currency'
import { formatDate } from '@/lib/format/date'
import type { CustomCakeStatus } from '@/types/database'
import { colors } from '@/theme/colors'

const STATUSES: CustomCakeStatus[] = [
  'submitted',
  'in_progress',
  'ready',
  'cancelled',
]

export default function AdminCustomCakesScreen() {
  const { orders, loading, error, setOrderStatus, saving } = useAdminCakeCatalog()

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
      {orders.length === 0 ? (
        <Text style={styles.empty}>Nicio comandă de tort.</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.title}>
              {order.size} · {order.flavor}
            </Text>
            <Text style={styles.meta}>
              {order.client_name ?? order.client_email ?? 'Client'} ·{' '}
              {formatDate(order.delivery_date)}
            </Text>
            <Text style={styles.price}>{formatPrice(order.calculated_price)}</Text>
            <Text style={styles.status}>{order.status}</Text>
            <View style={styles.statusRow}>
              {STATUSES.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.chip, order.status === s && styles.chipOn]}
                  onPress={() => void setOrderStatus(order.id, s)}
                  disabled={saving}
                >
                  <Text style={styles.chipText}>{s}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}
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
  title: { fontWeight: '700', fontSize: 16, color: colors.brown },
  meta: { fontSize: 13, color: colors.brownMuted, marginTop: 4 },
  price: { fontSize: 16, fontWeight: '700', color: colors.accent, marginTop: 6 },
  status: { marginTop: 6, fontSize: 13, color: colors.brown },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.warm },
  chipOn: { backgroundColor: colors.accent },
  chipText: { fontSize: 11 },
  error: { color: colors.danger },
  empty: { textAlign: 'center', color: colors.brownMuted, marginTop: 40 },
})
