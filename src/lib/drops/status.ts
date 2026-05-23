import { combineDropDateTime } from '@/lib/drops/datetime'
import type { DropPhase, DropWithProduct, EnrichedDrop } from '@/lib/drops/types'
import type { ProductDropRow } from '@/types/database'

export function getDropPhase(
  drop: ProductDropRow,
  now: Date = new Date(),
): DropPhase {
  if (!drop.is_active) return 'inactive'

  const start = combineDropDateTime(drop.drop_date, drop.start_time, 'start')
  const end = combineDropDateTime(drop.drop_date, drop.end_time, 'end')

  if (now < start) return 'upcoming'
  if (now > end) return 'ended'

  const remaining = drop.quantity_available - drop.quantity_sold
  if (remaining <= 0) return 'sold_out'

  return 'live'
}

export function getRemainingQuantity(drop: ProductDropRow): number {
  return Math.max(0, drop.quantity_available - drop.quantity_sold)
}

export function enrichDrop(
  drop: DropWithProduct,
  now: Date = new Date(),
): EnrichedDrop {
  const phase = getDropPhase(drop, now)
  const remaining = getRemainingQuantity(drop)
  const start = combineDropDateTime(drop.drop_date, drop.start_time, 'start')
  const end = combineDropDateTime(drop.drop_date, drop.end_time, 'end')

  let countdownTarget: Date | null = null
  let countdownMode: EnrichedDrop['countdownMode'] = null

  if (phase === 'upcoming') {
    countdownTarget = start
    countdownMode = 'to_start'
  } else if (phase === 'live') {
    countdownTarget = end
    countdownMode = 'to_end'
  }

  return {
    ...drop,
    phase,
    remaining,
    countdownTarget,
    countdownMode,
  }
}

export const dropPhaseLabels: Record<DropPhase, string> = {
  inactive: 'Inactiv',
  upcoming: 'În curând',
  live: 'Live acum',
  sold_out: 'Epuizat',
  ended: 'Încheiat',
}

export function sortEnrichedDrops(a: EnrichedDrop, b: EnrichedDrop): number {
  const order: Record<DropPhase, number> = {
    live: 0,
    upcoming: 1,
    sold_out: 2,
    ended: 3,
    inactive: 4,
  }
  const diff = order[a.phase] - order[b.phase]
  if (diff !== 0) return diff
  const aStart = combineDropDateTime(a.drop_date, a.start_time, 'start').getTime()
  const bStart = combineDropDateTime(b.drop_date, b.start_time, 'start').getTime()
  return aStart - bStart
}
