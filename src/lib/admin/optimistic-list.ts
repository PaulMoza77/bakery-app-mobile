/** Snapshot list state for rollback after failed mutations. */
export function snapshotList<T>(items: T[]): T[] {
  return [...items]
}

export function replaceById<T extends { id: string }>(
  items: T[],
  id: string,
  next: T,
): T[] {
  return items.map((item) => (item.id === id ? next : item))
}

export function patchById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
): T[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item))
}

export function removeById<T extends { id: string }>(items: T[], id: string): T[] {
  return items.filter((item) => item.id !== id)
}

export function prependItem<T>(items: T[], item: T): T[] {
  return [item, ...items]
}
