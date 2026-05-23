export type CakeBuilderStepId =
  | 'size'
  | 'flavor'
  | 'filling'
  | 'cream'
  | 'design'
  | 'personalize'
  | 'candles'
  | 'toppers'
  | 'extras'
  | 'delivery'

export interface CakeBuilderStep {
  id: CakeBuilderStepId
  label: string
  title: string
  subtitle: string
}

export interface CakeOptionChoice {
  id: string
  name: string
  description?: string
  priceModifierCents: number
}

export interface CakeAddonChoice {
  id: string
  name: string
  priceCents: number
}

export interface CakeBuilderSelections {
  sizeId: string | null
  flavorId: string | null
  fillingId: string | null
  creamId: string | null
  designId: string | null
  cakeText: string
  addonIds: string[]
  deliveryDate: string
  notes: string
}

export interface PriceLineItem {
  id: string
  label: string
  amountCents: number
  group: 'base' | 'option' | 'addon'
}

export interface CakePriceBreakdown {
  baseCents: number
  lines: PriceLineItem[]
  optionsTotalCents: number
  addonsTotalCents: number
  totalCents: number
}

export const INITIAL_SELECTIONS: CakeBuilderSelections = {
  sizeId: null,
  flavorId: null,
  fillingId: null,
  creamId: null,
  designId: null,
  cakeText: '',
  addonIds: [],
  deliveryDate: '',
  notes: '',
}
