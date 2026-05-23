import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { cartLineKey } from '@/lib/cart/line-key'
import type { CartLine } from '@/lib/cart/types'

const STORAGE_KEY = 'bakery-app-cart'

interface AddToCartInput {
  productId: string
  name: string
  unitPriceCents: number
  imageUrl?: string | null
  quantity?: number
  dropId?: string | null
  maxQuantity?: number
}

interface CartContextValue {
  lines: CartLine[]
  itemCount: number
  subtotalCents: number
  addItem: (input: AddToCartInput) => void
  setQuantity: (lineKey: string, quantity: number) => void
  removeItem: (lineKey: string) => void
  clearCart: () => void
  hydrated: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function normalizeLine(raw: Partial<CartLine> & { productId: string }): CartLine | null {
  const productId = raw.productId
  const dropId = raw.dropId ?? null
  const lineKey = raw.lineKey ?? cartLineKey(productId, dropId)
  const quantity = raw.quantity ?? 0
  if (!productId || typeof raw.name !== 'string' || quantity <= 0) return null
  if (typeof raw.unitPriceCents !== 'number') return null
  return {
    lineKey,
    productId,
    dropId,
    name: raw.name,
    unitPriceCents: raw.unitPriceCents,
    quantity,
    imageUrl: raw.imageUrl ?? null,
    maxQuantity: raw.maxQuantity,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return
        try {
          const parsed = JSON.parse(raw) as { lines?: Partial<CartLine>[] }
          if (!Array.isArray(parsed.lines)) return
          setLines(
            parsed.lines
              .map((l) => normalizeLine(l as Partial<CartLine> & { productId: string }))
              .filter((l): l is CartLine => l != null),
          )
        } catch {
          /* ignore */
        }
      })
      .finally(() => setHydrated(true))
  }, [])

  useEffect(() => {
    if (!hydrated) return
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ lines }))
  }, [lines, hydrated])

  const addItem = useCallback((input: AddToCartInput) => {
    const key = cartLineKey(input.productId, input.dropId)
    const qty = input.quantity ?? 1
    setLines((prev) => {
      const existing = prev.find((l) => l.lineKey === key)
      if (existing) {
        const cap = existing.maxQuantity ?? input.maxQuantity
        const nextQty = existing.quantity + qty
        const capped = cap != null ? Math.min(nextQty, cap) : nextQty
        return prev.map((l) =>
          l.lineKey === key ? { ...l, quantity: capped } : l,
        )
      }
      const cap = input.maxQuantity
      const initialQty = cap != null ? Math.min(qty, cap) : qty
      if (initialQty <= 0) return prev
      return [
        ...prev,
        {
          lineKey: key,
          productId: input.productId,
          dropId: input.dropId ?? null,
          name: input.name,
          unitPriceCents: input.unitPriceCents,
          quantity: initialQty,
          imageUrl: input.imageUrl ?? null,
          maxQuantity: cap,
        },
      ]
    })
  }, [])

  const setQuantity = useCallback((lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      setLines((prev) => prev.filter((l) => l.lineKey !== lineKey))
      return
    }
    setLines((prev) =>
      prev.map((l) => {
        if (l.lineKey !== lineKey) return l
        const capped =
          l.maxQuantity != null ? Math.min(quantity, l.maxQuantity) : quantity
        return { ...l, quantity: capped }
      }),
    )
  }, [])

  const removeItem = useCallback((lineKey: string) => {
    setLines((prev) => prev.filter((l) => l.lineKey !== lineKey))
  }, [])

  const clearCart = useCallback(() => setLines([]), [])

  const itemCount = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  )

  const subtotalCents = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity * l.unitPriceCents, 0),
    [lines],
  )

  const value = useMemo(
    () => ({
      lines,
      itemCount,
      subtotalCents,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      hydrated,
    }),
    [
      lines,
      itemCount,
      subtotalCents,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      hydrated,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider')
  }
  return ctx
}
