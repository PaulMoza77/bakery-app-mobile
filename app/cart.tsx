import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useCheckout } from '@/hooks/use-checkout'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'
import type { DeliveryType } from '@/types/database'

export default function CartScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { lines, setQuantity, removeItem, subtotalCents, hydrated } = useCart()
  const { placeOrder, submitting, error, isEmpty } = useCheckout()
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [successId, setSuccessId] = useState<string | null>(null)

  async function handlePlaceOrder() {
    if (!user) {
      router.push('/(auth)/login')
      return
    }
    const result = await placeOrder({
      delivery_type: deliveryType,
      delivery_date: deliveryDate || null,
      notes: notes.trim() || null,
    })
    if (result.ok) setSuccessId(result.order.id)
  }

  if (!hydrated) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  if (successId) {
    return (
      <Screen>
        <Card>
          <Text style={styles.successTitle}>Mulțumim!</Text>
          <Text style={styles.successSub}>
            Comanda ta a fost înregistrată. Plata se face la ridicare sau livrare (Stripe în curând).
          </Text>
          <Text style={styles.ref}>Ref: {successId.slice(0, 8)}…</Text>
          <View style={{ marginTop: 16, gap: 10 }}>
            <Button title="Vezi comenzile" onPress={() => router.replace('/orders')} />
            <Button title="Continuă" variant="secondary" onPress={() => router.replace('/(tabs)')} />
          </View>
        </Card>
      </Screen>
    )
  }

  if (isEmpty) {
    return (
      <Screen>
        <EmptyState
          title="Coșul este gol"
          description="Adaugă produse din tab-ul Produse."
        />
        <Button title="Explorează produsele" onPress={() => router.replace('/(tabs)')} />
      </Screen>
    )
  }

  return (
    <Screen>
      <Text style={styles.heading}>Coș ({lines.length})</Text>
      {lines.map((line) => (
        <Card key={line.lineKey} style={styles.line}>
          <View style={styles.lineRow}>
            {line.imageUrl ? (
              <Image source={{ uri: line.imageUrl }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <View style={styles.lineBody}>
              <Text style={styles.lineName}>{line.name}</Text>
              {line.dropId ? (
                <Text style={styles.dropTag}>Drop limitat</Text>
              ) : null}
              <Text style={styles.unitPrice}>{formatPrice(line.unitPriceCents)} / buc</Text>
              <View style={styles.qtyRow}>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(line.lineKey, line.quantity - 1)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{line.quantity}</Text>
                <Pressable
                  style={styles.qtyBtn}
                  onPress={() => setQuantity(line.lineKey, line.quantity + 1)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
                <Pressable onPress={() => removeItem(line.lineKey)}>
                  <Text style={styles.remove}>Șterge</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.lineTotal}>
              {formatPrice(line.unitPriceCents * line.quantity)}
            </Text>
          </View>
        </Card>
      ))}

      <Card style={styles.checkout}>
        <Text style={styles.section}>Livrare</Text>
        <View style={styles.toggleRow}>
          {(['pickup', 'delivery'] as DeliveryType[]).map((t) => (
            <Pressable
              key={t}
              style={[styles.toggle, deliveryType === t && styles.toggleActive]}
              onPress={() => setDeliveryType(t)}
            >
              <Text
                style={[styles.toggleText, deliveryType === t && styles.toggleTextActive]}
              >
                {t === 'pickup' ? 'Ridicare' : 'Livrare'}
              </Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.label}>Data (YYYY-MM-DD)</Text>
        <TextInput
          style={styles.input}
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholder="Opțional"
          placeholderTextColor={colors.brownMuted}
        />
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, { minHeight: 72 }]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholderTextColor={colors.brownMuted}
        />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.total}>{formatPrice(subtotalCents)}</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          title={user ? 'Plasează comanda' : 'Autentifică-te pentru comandă'}
          onPress={() => void handlePlaceOrder()}
          loading={submitting}
        />
      </Card>
    </Screen>
  )
}

const styles = StyleSheet.create({
  heading: { fontSize: 22, fontWeight: '700', color: colors.brown, marginBottom: 12 },
  line: { marginBottom: 10 },
  lineRow: { flexDirection: 'row', gap: 10 },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.warm },
  thumbPlaceholder: {},
  lineBody: { flex: 1 },
  lineName: { fontWeight: '600', color: colors.brown, fontSize: 16 },
  dropTag: { fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 2 },
  unitPrice: { fontSize: 13, color: colors.brownMuted, marginTop: 2 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: colors.brown },
  qty: { fontSize: 16, fontWeight: '600', minWidth: 24, textAlign: 'center' },
  remove: { marginLeft: 8, color: colors.danger, fontSize: 13 },
  lineTotal: { fontWeight: '700', color: colors.brown },
  checkout: { marginTop: 8 },
  section: { fontSize: 16, fontWeight: '700', color: colors.brown, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  toggle: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  toggleActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  toggleText: { color: colors.brown, fontWeight: '600' },
  toggleTextActive: { color: colors.white },
  label: { fontSize: 13, fontWeight: '600', color: colors.brown, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: colors.white,
    color: colors.brown,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  totalLabel: { fontSize: 16, color: colors.brownMuted },
  total: { fontSize: 20, fontWeight: '800', color: colors.brown },
  error: { color: colors.danger, marginBottom: 8 },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.brown },
  successSub: { marginTop: 8, fontSize: 14, color: colors.brownMuted, lineHeight: 20 },
  ref: { marginTop: 12, fontFamily: 'monospace', color: colors.brown },
})
