import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { SupportRepository } from '@/lib/support/repository/types'
import { SupabaseSupportRepository } from '@/lib/support/repository/supabase-repository'
import { SupportService } from '@/lib/support/service'

let repositoryInstance: SupportRepository | null = null
let serviceInstance: SupportService | null = null

export function getSupportRepository(): SupportRepository {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase nu este configurat.')
  }
  if (!repositoryInstance) {
    repositoryInstance = new SupabaseSupportRepository()
  }
  return repositoryInstance
}

export function getSupportService(): SupportService {
  if (!serviceInstance) {
    serviceInstance = new SupportService(getSupportRepository())
  }
  return serviceInstance
}

export type { SendClientMessageResult, SupportThreadWithMessages } from '@/lib/support/types'
export {
  clearPendingEscalationNotifications,
  dismissEscalationNotification,
  readPendingEscalationNotifications,
} from '@/lib/support/notifications/placeholder-notifier'
