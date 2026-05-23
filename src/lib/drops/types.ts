import type { ProductDropRow, ProductWithCategory } from '@/types/database'

export type DropPhase =
  | 'inactive'
  | 'upcoming'
  | 'live'
  | 'sold_out'
  | 'ended'

export type DropProductSummary = Pick<
  ProductWithCategory,
  'id' | 'name' | 'description' | 'price' | 'image_url' | 'is_preorder'
>

export interface DropWithProduct extends ProductDropRow {
  product: DropProductSummary
}

export interface EnrichedDrop extends DropWithProduct {
  phase: DropPhase
  remaining: number
  /** Target for countdown (start when upcoming, end when live) */
  countdownTarget: Date | null
  countdownMode: 'to_start' | 'to_end' | null
}

export interface CreateDropInput {
  product_id: string
  drop_date: string
  start_time: string | null
  end_time: string | null
  quantity_available: number
  is_active: boolean
}

export interface UpdateDropInput extends Partial<CreateDropInput> {
  quantity_sold?: number
}
