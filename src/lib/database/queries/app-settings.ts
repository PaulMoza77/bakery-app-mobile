import { supabase } from '@/lib/supabase/client'
import { runQuery } from '@/lib/database/helpers'
import { APP_SETTINGS_ID, DEFAULT_APP_SETTINGS } from '@/lib/branding/defaults'
import type { AppSettingsUpdate } from '@/lib/branding/types'
import type { AppSettingsRow } from '@/types/database'

const COLUMNS_LEGACY =
  'id, app_name, logo_url, favicon_url, primary_color, secondary_color, accent_color, background_color, text_color, heading_font, body_font, button_radius, card_radius, created_at, updated_at'

const COLUMNS_FULL = `${COLUMNS_LEGACY}, surface_color`

function isMissingSurfaceColumn(message: string | null | undefined): boolean {
  if (!message) return false
  return message.includes('surface_color')
}

function normalizeAppSettingsRow(
  row: Partial<AppSettingsRow> | null,
): AppSettingsRow {
  if (!row) return DEFAULT_APP_SETTINGS
  return {
    ...DEFAULT_APP_SETTINGS,
    ...row,
    surface_color: row.surface_color ?? DEFAULT_APP_SETTINGS.surface_color,
  }
}

async function selectAppSettings(columns: string) {
  return supabase!
    .from('app_settings')
    .select(columns)
    .eq('id', APP_SETTINGS_ID)
    .maybeSingle()
}

export async function fetchAppSettings() {
  return runQuery<AppSettingsRow>(DEFAULT_APP_SETTINGS, async () => {
    let { data, error } = await selectAppSettings(COLUMNS_FULL)

    if (error && isMissingSurfaceColumn(error.message)) {
      const legacy = await selectAppSettings(COLUMNS_LEGACY)
      data = legacy.data as typeof data
      error = legacy.error
    }

    if (error) return { data: DEFAULT_APP_SETTINGS, error }

    if (!data) {
      const seeded = await supabase!
        .from('app_settings')
        .insert({ id: APP_SETTINGS_ID })
        .select(COLUMNS_LEGACY)
        .single()
      return {
        data: normalizeAppSettingsRow(
          (seeded.data as unknown as AppSettingsRow | null) ?? null,
        ),
        error: seeded.error,
      }
    }

    return {
      data: normalizeAppSettingsRow(data as unknown as AppSettingsRow),
      error: null,
    }
  })
}

export async function updateAppSettings(patch: AppSettingsUpdate) {
  return runQuery<AppSettingsRow | null>(null, async () => {
    const payload = { id: APP_SETTINGS_ID, ...patch }

    let { data, error } = await supabase!
      .from('app_settings')
      .upsert(payload)
      .select(COLUMNS_FULL)
      .single()

    if (error && isMissingSurfaceColumn(error.message)) {
      const { surface_color: _s, ...legacyPayload } = payload
      const legacy = await supabase!
        .from('app_settings')
        .upsert(legacyPayload)
        .select(COLUMNS_LEGACY)
        .single()
      data = legacy.data as typeof data
      error = legacy.error
    }

    return {
      data: data
        ? normalizeAppSettingsRow(data as unknown as AppSettingsRow)
        : null,
      error,
    }
  })
}

export async function resetAppSettingsToDefaults() {
  const { id: _id, created_at: _c, updated_at: _u, ...defaults } =
    DEFAULT_APP_SETTINGS
  return updateAppSettings(defaults)
}
