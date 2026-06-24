import { useCallback, useState } from 'react'
import { mapAtelierEntitlement } from '@/lib/atelier/mappers'
import { purchaseAtelierProduct } from '@/lib/atelier/payment'
import type { AtelierEntitlement, AtelierProduct } from '@/lib/atelier/types'

export function usePurchaseAtelier(onSuccess?: () => void) {
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const purchase = useCallback(
    async (userId: string, product: AtelierProduct): Promise<AtelierEntitlement | null> => {
      setPurchasing(true)
      setError(null)
      const result = await purchaseAtelierProduct(userId, product)
      setPurchasing(false)

      if (!result.success || !result.entitlement) {
        setError(result.error ?? 'Plata a eșuat.')
        return null
      }

      onSuccess?.()
      return mapAtelierEntitlement(result.entitlement)
    },
    [onSuccess],
  )

  return { purchase, purchasing, error, clearError: () => setError(null) }
}
