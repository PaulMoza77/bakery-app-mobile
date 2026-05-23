import type { CakeCatalog } from '@/lib/cake-builder/catalog'

export function ensurePrintedImageAddon(
  addonIds: string[],
  catalog: CakeCatalog,
  include: boolean,
): string[] {
  const id = catalog.printedImageAddonId
  if (!id) return addonIds
  const has = addonIds.includes(id)
  if (include && !has) return [...addonIds, id]
  if (!include && has) return addonIds.filter((x) => x !== id)
  return addonIds
}
