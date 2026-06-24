import type { AppSettingsRow } from '@/types/database'

export const APP_SETTINGS_ID = 'default' as const

export const DEFAULT_APP_SETTINGS: AppSettingsRow = {
  id: APP_SETTINGS_ID,
  app_name: 'Patiseria Noastră',
  logo_url: null,
  favicon_url: null,
  primary_color: '#5C4033',
  secondary_color: '#F5E6D3',
  accent_color: '#C45C26',
  background_color: '#FBF7F2',
  surface_color: '#FFFFFF',
  text_color: '#5C4033',
  heading_font: 'Fraunces',
  body_font: 'DM Sans',
  button_radius: '0.75rem',
  card_radius: '1.25rem',
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
}

export const BRANDING_FONT_OPTIONS = [
  { value: 'Fraunces', label: 'Fraunces (serif)' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Georgia', label: 'Georgia (sistem)' },
] as const

export const BRANDING_RADIUS_OPTIONS = [
  { value: '0.5rem', label: 'Mic (8px)' },
  { value: '0.75rem', label: 'Mediu (12px)' },
  { value: '1rem', label: 'Mare (16px)' },
  { value: '1.25rem', label: 'Foarte mare (20px)' },
] as const
