export type CakeCustomizerOptionType =
  | 'persons'
  | 'tier'
  | 'sponge'
  | 'cream'
  | 'glaze'
  | 'theme'
  | 'color'

export interface CakeCustomizerOption {
  id: string
  type: CakeCustomizerOptionType
  nameRo: string
  nameEn?: string
  descriptionRo: string
  imageUrl: string
  basePrice?: number
  extraPrice?: number
  isActive: boolean
  sortOrder: number
  /** Used for persons options — midpoint guest count for display/pricing */
  personsCount?: number
  /** Used for tier options */
  tierCount?: 1 | 2 | 3
  /** Used for color swatches */
  swatchColor?: string
}

export interface CakeCustomizationState {
  personsOptionId: string | null
  personsCount: number | null
  tiers: 1 | 2 | 3 | null
  spongeId: string | null
  creamId: string | null
  glazeId: string | null
  themeId?: string | null
  color?: string | null
  customText?: string
  uploadedInspirationImage?: string | null
  notes?: string
  estimatedPrice: number
}

export type CakeCustomizerStepId =
  | 'persons'
  | 'tiers'
  | 'sponge'
  | 'cream'
  | 'glaze'
  | 'personalization'
  | 'summary'

export interface CakeCustomizerStep {
  id: CakeCustomizerStepId
  title: string
  subtitle: string
}

export interface CakeCustomizerCatalog {
  persons: CakeCustomizerOption[]
  tiers: CakeCustomizerOption[]
  sponges: CakeCustomizerOption[]
  creams: CakeCustomizerOption[]
  glazes: CakeCustomizerOption[]
  themes: CakeCustomizerOption[]
  colors: CakeCustomizerOption[]
}

export interface CakePriceLine {
  label: string
  amountCents: number
}

export interface CakePriceBreakdown {
  lines: CakePriceLine[]
  totalCents: number
}

export interface CakeCustomizationRequestPayload {
  state: CakeCustomizationState
  breakdown: CakePriceBreakdown
  submittedAt: string
}

export const INITIAL_CAKE_CUSTOMIZATION_STATE: CakeCustomizationState = {
  personsOptionId: null,
  personsCount: null,
  tiers: null,
  spongeId: null,
  creamId: null,
  glazeId: null,
  themeId: null,
  color: null,
  customText: '',
  uploadedInspirationImage: null,
  notes: '',
  estimatedPrice: 0,
}
