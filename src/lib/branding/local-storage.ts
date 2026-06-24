import { DEFAULT_APP_SETTINGS } from '@/lib/branding/defaults'
import type { AppSettingsUpdate } from '@/lib/branding/types'
import { appLocalStorage } from '@/lib/storage/app-local-storage'
import type { AppSettingsRow } from '@/types/database'

const STORAGE_KEY = 'bakery_app_branding_v1'

export function loadLocalAppSettings(): AppSettingsRow {
  try {
    const raw = appLocalStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_APP_SETTINGS
    return { ...DEFAULT_APP_SETTINGS, ...(JSON.parse(raw) as AppSettingsRow) }
  } catch {
    return DEFAULT_APP_SETTINGS
  }
}

export function saveLocalAppSettings(patch: AppSettingsUpdate): AppSettingsRow {
  const current = loadLocalAppSettings()
  const next: AppSettingsRow = {
    ...current,
    ...patch,
    id: DEFAULT_APP_SETTINGS.id,
    updated_at: new Date().toISOString(),
  }
  appLocalStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function resetLocalAppSettings(): AppSettingsRow {
  appLocalStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_APP_SETTINGS))
  return DEFAULT_APP_SETTINGS
}
