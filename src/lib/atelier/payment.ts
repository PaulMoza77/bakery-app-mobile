import { grantAtelierAccess } from '@/lib/database/queries/atelier-entitlements'
import type { AtelierProduct } from '@/lib/atelier/types'
import type { AtelierEntitlementRow } from '@/types/database'

export interface PurchaseResult {
  success: boolean
  entitlement: AtelierEntitlementRow | null
  error: string | null
}

/**
 * Payment abstraction — mock success today; swap body for Stripe Checkout / PaymentIntent later.
 */
export async function purchaseAtelierProduct(
  userId: string,
  product: AtelierProduct,
): Promise<PurchaseResult> {
  // Simulate network + payment processing
  await new Promise((resolve) => setTimeout(resolve, 800))

  const result = await grantAtelierAccess(userId, product.id, 'paid')

  if (result.error || !result.data) {
    return {
      success: false,
      entitlement: null,
      error: result.error ?? 'Plata nu a putut fi finalizată.',
    }
  }

  if (!result.data.access_granted) {
    return {
      success: false,
      entitlement: result.data,
      error: 'Accesul nu a fost acordat. Contactează suportul.',
    }
  }

  return { success: true, entitlement: result.data, error: null }
}

export function purchaseCtaLabel(product: AtelierProduct, hasAccess: boolean): string {
  if (hasAccess) {
    if (product.type === 'event') return 'Loc rezervat'
    if (product.type === 'workshop') return 'Acces deblocat'
    return 'Rețetă deblocată'
  }
  if (product.type === 'event') return 'Rezervă loc'
  if (product.type === 'workshop') return 'Cumpără acces'
  return 'Cumpără rețeta'
}
