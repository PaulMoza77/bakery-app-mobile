import type { EnrichedDrop } from '@/lib/drops/types'

export interface PartitionedDrops {
  live: EnrichedDrop[]
  upcoming: EnrichedDrop[]
  soldOut: EnrichedDrop[]
  ended: EnrichedDrop[]
}

export function partitionDrops(drops: EnrichedDrop[]): PartitionedDrops {
  const live: EnrichedDrop[] = []
  const upcoming: EnrichedDrop[] = []
  const soldOut: EnrichedDrop[] = []
  const ended: EnrichedDrop[] = []

  for (const drop of drops) {
    switch (drop.phase) {
      case 'live':
        live.push(drop)
        break
      case 'upcoming':
        upcoming.push(drop)
        break
      case 'sold_out':
        soldOut.push(drop)
        break
      case 'ended':
      case 'inactive':
        ended.push(drop)
        break
      default:
        break
    }
  }

  return { live, upcoming, soldOut, ended }
}

/** Banner target: live drop first, else nearest upcoming. */
export function pickPrimaryDrop(drops: EnrichedDrop[]): EnrichedDrop | null {
  const { live, upcoming } = partitionDrops(drops)
  if (live.length > 0) return live[0]
  if (upcoming.length > 0) return upcoming[0]
  return null
}
