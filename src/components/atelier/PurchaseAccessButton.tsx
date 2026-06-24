import { Text, View, StyleSheet } from 'react-native'
import { Button } from '@/components/ui/Button'
import { purchaseCtaLabel } from '@/lib/atelier/payment'
import type { AtelierProduct } from '@/lib/atelier/types'
import { colors } from '@/theme/colors'

interface PurchaseAccessButtonProps {
  product: AtelierProduct
  hasAccess: boolean
  loading?: boolean
  disabled?: boolean
  onPurchase: () => void
  error?: string | null
}

export function PurchaseAccessButton({
  product,
  hasAccess,
  loading,
  disabled,
  onPurchase,
  error,
}: PurchaseAccessButtonProps) {
  const soldOut =
    product.type === 'event' &&
    !hasAccess &&
    product.seatsAvailable != null &&
    product.seatsAvailable <= 0

  return (
    <View style={styles.wrap}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {soldOut ? (
        <Text style={styles.soldOut}>Nu mai sunt locuri disponibile.</Text>
      ) : null}
      <Button
        title={purchaseCtaLabel(product, hasAccess)}
        onPress={onPurchase}
        loading={loading}
        disabled={hasAccess || soldOut || disabled}
        variant={hasAccess ? 'secondary' : 'primary'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginTop: 16, gap: 8 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  soldOut: { color: colors.brownMuted, fontSize: 14, fontWeight: '600' },
})
