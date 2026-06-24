import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import type { AtelierEntitlementRow, AtelierPurchaseStatus } from '@/types/database'

const COLS =
  'id, user_id, product_id, product_type, purchase_status, access_granted, purchased_at, created_at, updated_at'

export async function fetchUserEntitlements(userId: string) {
  return runQuery<AtelierEntitlementRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('atelier_entitlements')
      .select(COLS)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false, nullsFirst: false })
    return { data: (data as AtelierEntitlementRow[]) ?? [], error }
  })
}

export async function fetchUserEntitlementForProduct(userId: string, productId: string) {
  return runQuery<AtelierEntitlementRow | null>(null, async () => {
    const { data, error } = await supabase!
      .from('atelier_entitlements')
      .select(COLS)
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle()
    return { data: (data as AtelierEntitlementRow | null) ?? null, error }
  })
}

export async function grantAtelierAccess(
  userId: string,
  productId: string,
  purchaseStatus: AtelierPurchaseStatus = 'paid',
) {
  return runQuery<AtelierEntitlementRow | null>(null, async () => {
    const { data, error } = await supabase!.rpc('grant_atelier_access', {
      p_user_id: userId,
      p_product_id: productId,
      p_purchase_status: purchaseStatus,
    })
    return { data: (data as AtelierEntitlementRow | null) ?? null, error }
  })
}

export async function fetchGrantedEntitlements(userId: string) {
  return runQuery<AtelierEntitlementRow[]>([], async () => {
    const { data, error } = await supabase!
      .from('atelier_entitlements')
      .select(COLS)
      .eq('user_id', userId)
      .eq('access_granted', true)
      .order('purchased_at', { ascending: false, nullsFirst: false })
    return { data: (data as AtelierEntitlementRow[]) ?? [], error }
  })
}
