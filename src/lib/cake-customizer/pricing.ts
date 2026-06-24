import { PERSONALIZATION_FEES } from '@/lib/cake-customizer/cakeCustomizer.mock'
import type {
  CakeCustomizerCatalog,
  CakeCustomizationState,
  CakePriceBreakdown,
} from '@/lib/cake-customizer/types'

function findOption<T extends { id: string }>(list: T[], id: string | null | undefined) {
  if (!id) return undefined
  return list.find((item) => item.id === id)
}

export function calculateCakeCustomizationPrice(
  state: CakeCustomizationState,
  catalog: CakeCustomizerCatalog,
): CakePriceBreakdown {
  const lines: CakePriceBreakdown['lines'] = []

  const persons = findOption(catalog.persons, state.personsOptionId)
  if (persons?.basePrice != null) {
    lines.push({
      label: `Bază · ${persons.nameRo}`,
      amountCents: persons.basePrice,
    })
  }

  const tier = catalog.tiers.find((t) => t.tierCount === state.tiers)
  if (tier && (tier.extraPrice ?? 0) > 0) {
    lines.push({
      label: `Etaje · ${tier.nameRo}`,
      amountCents: tier.extraPrice ?? 0,
    })
  }

  const sponge = findOption(catalog.sponges, state.spongeId)
  if (sponge && (sponge.extraPrice ?? 0) > 0) {
    lines.push({ label: `Blat · ${sponge.nameRo}`, amountCents: sponge.extraPrice ?? 0 })
  }

  const cream = findOption(catalog.creams, state.creamId)
  if (cream && (cream.extraPrice ?? 0) > 0) {
    lines.push({ label: `Cremă · ${cream.nameRo}`, amountCents: cream.extraPrice ?? 0 })
  }

  const glaze = findOption(catalog.glazes, state.glazeId)
  if (glaze && (glaze.extraPrice ?? 0) > 0) {
    lines.push({ label: `Finisaj · ${glaze.nameRo}`, amountCents: glaze.extraPrice ?? 0 })
  }

  if (state.customText?.trim()) {
    lines.push({
      label: 'Text pe tort',
      amountCents: PERSONALIZATION_FEES.customText,
    })
  }

  if (state.color) {
    const colorOpt = findOption(catalog.colors, state.color)
    const colorExtra = colorOpt?.extraPrice ?? PERSONALIZATION_FEES.color
    if (colorExtra > 0) {
      lines.push({
        label: `Culoare · ${colorOpt?.nameRo ?? 'Personalizată'}`,
        amountCents: colorExtra,
      })
    }
  }

  if (state.themeId) {
    const theme = findOption(catalog.themes, state.themeId)
    const themeExtra = theme?.extraPrice ?? PERSONALIZATION_FEES.theme
    if (themeExtra > 0) {
      lines.push({
        label: `Temă · ${theme?.nameRo ?? 'Personalizată'}`,
        amountCents: themeExtra,
      })
    }
  }

  const totalCents = lines.reduce((sum, line) => sum + line.amountCents, 0)
  return { lines, totalCents }
}
