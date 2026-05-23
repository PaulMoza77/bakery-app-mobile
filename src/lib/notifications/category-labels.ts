import type { NotificationCategory } from '@/types/database'

const LABELS: Record<NotificationCategory, string> = {
  system: 'Sistem',
  order: 'Comandă',
  offer: 'Ofertă',
  support: 'Suport',
  promo: 'Promoție',
}

export function notificationCategoryLabel(category: NotificationCategory): string {
  return LABELS[category] ?? category
}
