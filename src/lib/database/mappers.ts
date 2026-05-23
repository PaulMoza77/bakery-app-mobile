import type { ProductWithCategory } from '@/types/database'

export function mapProductRow(row: unknown): ProductWithCategory {
  const r = row as ProductWithCategory
  const cat = r.categories
  if (Array.isArray(cat)) {
    return { ...r, categories: cat[0] ?? null }
  }
  return r
}

export function mapProductRows(rows: unknown): ProductWithCategory[] {
  if (!Array.isArray(rows)) return []
  return rows.map(mapProductRow)
}

export function getCategoryName(product: ProductWithCategory): string | null {
  const cat = product.categories
  if (!cat) return null
  if (Array.isArray(cat)) return cat[0]?.name ?? null
  return cat.name
}
