import { isSupabaseConfigured } from '@/lib/supabase/client'
import { LocalSupportRepository } from '@/lib/support/repository/local-repository'
import type { SupportRepository } from '@/lib/support/repository/types'
import { SupabaseSupportRepository } from '@/lib/support/repository/supabase-repository'
import { SupportService } from '@/lib/support/service'

let repositoryInstance: SupportRepository | null = null
let serviceInstance: SupportService | null = null

export function getSupportRepository(): SupportRepository {
  if (!repositoryInstance) {
    repositoryInstance = isSupabaseConfigured
      ? new SupabaseSupportRepository()
      : new LocalSupportRepository()
  }
  return repositoryInstance
}

/** Single entry point for support flows — swap repository/AI via DI later */
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
