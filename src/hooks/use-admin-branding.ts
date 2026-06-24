import { useCallback, useState } from 'react'
import { useBranding } from '@/contexts/BrandingContext'
import type { AppSettingsUpdate } from '@/lib/branding/types'

export function useAdminBranding() {
  const { settings, loading, error, configured, saveSettings, resetToDefaults } =
    useBranding()
  const [draft, setDraft] = useState<AppSettingsUpdate | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const form = draft ?? settings

  const setField = useCallback(
    <K extends keyof AppSettingsUpdate>(key: K, value: AppSettingsUpdate[K]) => {
      setDraft((prev) => ({
        ...(prev ?? settings),
        [key]: value,
      }))
      setSaveMessage(null)
    },
    [settings],
  )

  const save = useCallback(async () => {
    setSaving(true)
    setSaveMessage(null)
    const patch: AppSettingsUpdate = {
      app_name: form.app_name,
      logo_url: form.logo_url,
      favicon_url: form.favicon_url,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      accent_color: form.accent_color,
      background_color: form.background_color,
      surface_color: form.surface_color,
      text_color: form.text_color,
      heading_font: form.heading_font,
      body_font: form.body_font,
      button_radius: form.button_radius,
      card_radius: form.card_radius,
    }
    const result = await saveSettings(patch)
    setSaving(false)
    if (result.error) {
      setSaveMessage(result.error)
      return false
    }
    setDraft(null)
    setSaveMessage('Setările au fost salvate.')
    return true
  }, [form, saveSettings])

  const reset = useCallback(async () => {
    setSaving(true)
    setSaveMessage(null)
    const result = await resetToDefaults()
    setSaving(false)
    if (result.error) {
      setSaveMessage(result.error)
      return false
    }
    setDraft(null)
    setSaveMessage('Branding resetat la valorile implicite.')
    return true
  }, [resetToDefaults])

  const discardDraft = useCallback(() => {
    setDraft(null)
    setSaveMessage(null)
  }, [])

  const isDirty = draft != null

  return {
    form,
    loading,
    error,
    configured,
    saving,
    saveMessage,
    isDirty,
    setField,
    save,
    reset,
    discardDraft,
  }
}
