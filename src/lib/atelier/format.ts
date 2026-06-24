export function formatEventDateTime(product: {
  eventDate: string | null
  eventTime: string | null
}): string {
  if (!product.eventDate) return 'Dată de confirmat'

  const datePart = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${product.eventDate}T12:00:00`))

  if (!product.eventTime) return datePart

  const [hours, minutes] = product.eventTime.split(':')
  const timePart = `${hours}:${minutes}`
  return `${datePart}, ora ${timePart}`
}
