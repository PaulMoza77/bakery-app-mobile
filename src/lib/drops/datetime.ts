/** Combine Postgres `date` + `time` into local Date */
export function combineDropDateTime(
  dropDate: string,
  time: string | null,
  fallback: 'start' | 'end',
): Date {
  const raw = time?.trim() ?? ''
  const normalized =
    raw.length >= 5
      ? raw.slice(0, 8)
      : fallback === 'start'
        ? '00:00:00'
        : '23:59:59'

  const [year, month, day] = dropDate.split('-').map(Number)
  const parts = normalized.split(':').map(Number)
  const hours = parts[0] ?? 0
  const minutes = parts[1] ?? 0
  const seconds = parts[2] ?? 0

  return new Date(year, month - 1, day, hours, minutes, seconds)
}

export function formatDropTimeRange(
  startTime: string | null,
  endTime: string | null,
): string {
  const fmt = (t: string | null) => {
    if (!t) return null
    const [h, m] = t.slice(0, 5).split(':')
    return `${h}:${m}`
  }
  const start = fmt(startTime)
  const end = fmt(endTime)
  if (start && end) return `${start} – ${end}`
  if (start) return `de la ${start}`
  if (end) return `până la ${end}`
  return 'Toată ziua'
}
