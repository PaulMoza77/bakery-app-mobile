/** Integer cents (RON bani) → display string */
export function formatMoney(cents: number): string {
  const lei = cents / 100
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    maximumFractionDigits: lei % 1 === 0 ? 0 : 2,
  }).format(lei)
}

/** Storefront alias — same as {@link formatMoney} */
export function formatPrice(cents: number): string {
  return formatMoney(cents)
}
