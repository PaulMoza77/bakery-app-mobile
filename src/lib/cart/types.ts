export interface CartLine {
  lineKey: string
  productId: string
  dropId: string | null
  name: string
  unitPriceCents: number
  quantity: number
  imageUrl: string | null
  /** Max quantity when tied to a live drop (remaining stock). */
  maxQuantity?: number
}

export interface CartState {
  lines: CartLine[]
}
