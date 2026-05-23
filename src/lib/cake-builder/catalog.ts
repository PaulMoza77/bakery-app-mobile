import type { CakeAddonCategory, CakeAddonRow, CakeOptionRow } from '@/types/database'
import type { CakeAddonChoice, CakeOptionChoice } from '@/lib/cake-builder/types'

export interface CakeCatalog {
  sizes: CakeOptionChoice[]
  flavors: CakeOptionChoice[]
  fillings: CakeOptionChoice[]
  creams: CakeOptionChoice[]
  designs: CakeOptionChoice[]
  candles: CakeAddonChoice[]
  toppers: CakeAddonChoice[]
  extras: CakeAddonChoice[]
  /** All add-ons for pricing */
  allAddons: CakeAddonChoice[]
  printedImageAddonId: string | null
}

export const EMPTY_CAKE_CATALOG: CakeCatalog = {
  sizes: [],
  flavors: [],
  fillings: [],
  creams: [],
  designs: [],
  candles: [],
  toppers: [],
  extras: [],
  allAddons: [],
  printedImageAddonId: null,
}

function mapOption(row: CakeOptionRow): CakeOptionChoice {
  return {
    id: row.id,
    name: row.name,
    priceModifierCents: row.price_modifier,
  }
}

function mapAddon(row: CakeAddonRow): CakeAddonChoice {
  return {
    id: row.id,
    name: row.name,
    priceCents: row.price,
  }
}

function normalizeCategory(row: CakeAddonRow): CakeAddonCategory {
  if (row.category) return row.category
  const n = row.name.toLowerCase()
  if (n.includes('lumân') || n.includes('luman') || n.includes('candle')) {
    return 'candles'
  }
  if (n.includes('topper')) return 'topper'
  return 'extra'
}

function isPrintedImageAddon(name: string): boolean {
  const n = name.toLowerCase()
  return n.includes('print') || n.includes('imagine')
}

export function buildCakeCatalog(
  options: CakeOptionRow[],
  addons: CakeAddonRow[],
): CakeCatalog {
  const byType = (type: CakeOptionRow['type']) =>
    options.filter((o) => o.type === type).map(mapOption)

  const mapped = addons.map((row) => ({
    row,
    choice: mapAddon(row),
    category: normalizeCategory(row),
  }))

  const candles = mapped.filter((m) => m.category === 'candles').map((m) => m.choice)
  const toppers = mapped.filter((m) => m.category === 'topper').map((m) => m.choice)
  const extras = mapped.filter((m) => m.category === 'extra').map((m) => m.choice)
  const allAddons = mapped.map((m) => m.choice)

  const printRow = mapped.find((m) => isPrintedImageAddon(m.row.name))

  return {
    sizes: byType('size'),
    flavors: byType('flavor'),
    fillings: byType('filling'),
    creams: byType('cream'),
    designs: byType('design_style'),
    candles,
    toppers,
    extras,
    allAddons,
    printedImageAddonId: printRow?.choice.id ?? null,
  }
}

export function isCakeCatalogReady(catalog: CakeCatalog): boolean {
  return (
    catalog.sizes.length > 0 &&
    catalog.flavors.length > 0 &&
    catalog.fillings.length > 0 &&
    catalog.creams.length > 0 &&
    catalog.designs.length > 0
  )
}
