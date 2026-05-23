/** Stable cart line identity (catalog vs drop for same product). */
export function cartLineKey(productId: string, dropId?: string | null): string {
  return dropId ? `drop:${dropId}` : `product:${productId}`
}
