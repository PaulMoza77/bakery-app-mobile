import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEFAULT_APP_SETTINGS } from '@/lib/branding/defaults'
import {
  loadLocalAppSettings,
  resetLocalAppSettings,
  saveLocalAppSettings,
} from '@/lib/branding/local-storage'
import { DEFAULT_APP_THEME, settingsToTheme, type AppTheme } from '@/lib/branding/theme'
import type { AppSettingsUpdate } from '@/lib/branding/types'
import {
  fetchAppSettings,
  resetAppSettingsToDefaults,
  updateAppSettings,
} from '@/lib/database/queries/app-settings'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import type { AppSettingsRow } from '@/types/database'

interface BrandingContextValue {
  settings: AppSettingsRow
  theme: AppTheme
  loading: boolean
  error: string | null
  configured: boolean
  refresh: () => Promise<void>
  saveSettings: (patch: AppSettingsUpdate) => Promise<{ error: string | null }>
  resetToDefaults: () => Promise<{ error: string | null }>
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettingsRow>(DEFAULT_APP_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const theme = useMemo(() => settingsToTheme(settings), [settings])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!isSupabaseConfigured) {
      const local = loadLocalAppSettings()
      setSettings(local)
      setLoading(false)
      return
    }

    const result = await fetchAppSettings()
    setSettings(result.data)
    saveLocalAppSettings(result.data)
    setError(result.error)
    setLoading(false)
  }, [])

  useEffect(() => {
    const cached = loadLocalAppSettings()
    setSettings(cached)
    void refresh()
  }, [refresh])

  const saveSettings = useCallback(async (patch: AppSettingsUpdate) => {
    setError(null)
    if (!isSupabaseConfigured) {
      const next = saveLocalAppSettings(patch)
      setSettings(next)
      return { error: null }
    }
    const result = await updateAppSettings(patch)
    if (result.error || !result.data) {
      const msg = result.error ?? 'Salvare eșuat'
      setError(msg)
      return { error: msg }
    }
    setSettings(result.data)
    saveLocalAppSettings(result.data)
    return { error: null }
  }, [])

  const resetToDefaults = useCallback(async () => {
    setError(null)
    if (!isSupabaseConfigured) {
      const next = resetLocalAppSettings()
      setSettings(next)
      return { error: null }
    }
    const result = await resetAppSettingsToDefaults()
    if (result.error || !result.data) {
      const msg = result.error ?? 'Reset eșuat'
      setError(msg)
      return { error: msg }
    }
    setSettings(result.data)
    saveLocalAppSettings(result.data)
    return { error: null }
  }, [])

  const value = useMemo<BrandingContextValue>(
    () => ({
      settings,
      theme,
      loading,
      error,
      configured: isSupabaseConfigured,
      refresh,
      saveSettings,
      resetToDefaults,
    }),
    [settings, theme, loading, error, refresh, saveSettings, resetToDefaults],
  )

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  )
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    throw new Error('useBranding must be used within BrandingProvider')
  }
  return ctx
}

export function useAppTheme(): AppTheme {
  const ctx = useContext(BrandingContext)
  return ctx?.theme ?? DEFAULT_APP_THEME
}
