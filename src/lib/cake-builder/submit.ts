import type { CakeCatalog } from '@/lib/cake-builder/catalog'
import type { CreateCustomCakeOrderInput } from '@/lib/database/queries/cake-catalog'
import type { CakeBuilderSelections } from '@/lib/cake-builder/types'

function labelFor(
  list: CakeCatalog['sizes'],
  id: string | null,
): string {
  if (!id) return ''
  return list.find((o) => o.id === id)?.name ?? ''
}

export function buildCustomCakeOrderInput(
  userId: string,
  selections: CakeBuilderSelections,
  catalog: CakeCatalog,
  calculatedPrice: number,
  printedImageUrl: string | null,
): CreateCustomCakeOrderInput {
  const deliveryDate = selections.deliveryDate
    ? new Date(`${selections.deliveryDate}T12:00:00`).toISOString()
    : new Date().toISOString()

  const addonSnapshots = selections.addonIds
    .map((id) => catalog.allAddons.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .map((a) => ({ name: a.name, price: a.priceCents }))

  return {
    user_id: userId,
    size: labelFor(catalog.sizes, selections.sizeId),
    flavor: labelFor(catalog.flavors, selections.flavorId),
    filling: labelFor(catalog.fillings, selections.fillingId),
    cream: labelFor(catalog.creams, selections.creamId),
    design_style: labelFor(catalog.designs, selections.designId),
    cake_text: selections.cakeText.trim() || null,
    printed_image_url: printedImageUrl,
    addons: addonSnapshots,
    calculated_price: calculatedPrice,
    delivery_date: deliveryDate,
    notes: selections.notes.trim() || null,
    status: 'submitted',
  }
}
