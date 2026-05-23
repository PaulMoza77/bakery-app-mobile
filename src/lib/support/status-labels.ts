import type { SupportThreadStatus } from '@/types/database'

export const supportThreadStatusLabels: Record<SupportThreadStatus, string> = {
  open: 'Deschis',
  escalated: 'Escaladat',
  closed: 'Închis',
}
