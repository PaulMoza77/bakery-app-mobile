import type { CakeCatalog } from '@/lib/cake-builder/catalog'
import type {
  CakeBuilderSelections,
  CakeOptionChoice,
  CakePriceBreakdown,
  PriceLineItem,
} from '@/lib/cake-builder/types'

function findOption(
  options: CakeOptionChoice[],
  id: string | null,
): CakeOptionChoice | undefined {
  if (!id) return undefined
  return options.find((o) => o.id === id)
}

export function calculateCakePrice(
  selections: CakeBuilderSelections,
  catalog: CakeCatalog,
): CakePriceBreakdown {
  const lines: PriceLineItem[] = []
  let baseCents = 0
  let optionsTotalCents = 0
  let addonsTotalCents = 0

  const size = findOption(catalog.sizes, selections.sizeId)
  if (size && selections.sizeId) {
    baseCents = size.priceModifierCents
    lines.push({
      id: 'base',
      label: `Preț bază tort · ${size.name}`,
      amountCents: baseCents,
      group: 'base',
    })
  }

  const optionGroups: {
    id: string | null
    list: CakeOptionChoice[]
    prefix: string
  }[] = [
    { id: selections.flavorId, list: catalog.flavors, prefix: 'Aromă' },
    { id: selections.fillingId, list: catalog.fillings, prefix: 'Umplutură' },
    { id: selections.creamId, list: catalog.creams, prefix: 'Cremă' },
    { id: selections.designId, list: catalog.designs, prefix: 'Design' },
  ]

  for (const { id, list, prefix } of optionGroups) {
    const opt = findOption(list, id)
    if (opt && opt.priceModifierCents > 0) {
      lines.push({
        id: opt.id,
        label: `${prefix}: ${opt.name}`,
        amountCents: opt.priceModifierCents,
        group: 'option',
      })
      optionsTotalCents += opt.priceModifierCents
    }
  }

  for (const addonId of selections.addonIds) {
    const addon = catalog.allAddons.find((a) => a.id === addonId)
    if (addon) {
      lines.push({
        id: addon.id,
        label: addon.name,
        amountCents: addon.priceCents,
        group: 'addon',
      })
      addonsTotalCents += addon.priceCents
    }
  }

  const totalCents = baseCents + optionsTotalCents + addonsTotalCents

  return {
    baseCents,
    lines,
    optionsTotalCents,
    addonsTotalCents,
    totalCents,
  }
}
