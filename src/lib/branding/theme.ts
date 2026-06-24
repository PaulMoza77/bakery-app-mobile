import type { AppSettingsRow } from '@/types/database'
import { DEFAULT_APP_SETTINGS } from '@/lib/branding/defaults'

export interface AppTheme {
  appName: string
  logoUrl: string | null
  faviconUrl: string | null
  colors: {
    primary: string
    secondary: string
    accent: string
    accentHover: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    white: string
    cream: string
    warm: string
    brown: string
    brownMuted: string
    danger: string
    success: string
  }
  radii: {
    button: number
    card: number
  }
  fonts: {
    heading: string
    body: string
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.trim().replace('#', '')
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null
  const n = parseInt(normalized, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

function darkenHex(hex: string, factor = 0.15): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const d = (c: number) => Math.max(0, Math.round(c * (1 - factor)))
  const toHex = (c: number) => c.toString(16).padStart(2, '0')
  return `#${toHex(d(rgb.r))}${toHex(d(rgb.g))}${toHex(d(rgb.b))}`
}

function lightenHex(hex: string, factor = 0.35): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  const mix = (c: number) => Math.min(255, Math.round(c + (255 - c) * factor))
  const toHex = (c: number) => c.toString(16).padStart(2, '0')
  return `#${toHex(mix(rgb.r))}${toHex(mix(rgb.g))}${toHex(mix(rgb.b))}`
}

export function parseRadius(value: string): number {
  const v = value.trim()
  if (v.endsWith('rem')) return Math.round(parseFloat(v) * 16) || 12
  if (v.endsWith('px')) return Math.round(parseFloat(v)) || 12
  const n = parseFloat(v)
  return Number.isFinite(n) ? Math.round(n) : 12
}

const RN_FONT_MAP: Record<string, string> = {
  Fraunces: 'Georgia',
  'Playfair Display': 'Georgia',
  Lora: 'Georgia',
  Georgia: 'Georgia',
  'DM Sans': 'System',
  Inter: 'System',
}

export function resolveFontFamily(fontName: string, kind: 'heading' | 'body'): string {
  if (fontName === 'Georgia') {
    return kind === 'heading' ? 'Georgia' : 'System'
  }
  return RN_FONT_MAP[fontName] ?? (kind === 'heading' ? 'Georgia' : 'System')
}

export function settingsToTheme(settings: AppSettingsRow): AppTheme {
  const accent = settings.accent_color || DEFAULT_APP_SETTINGS.accent_color
  const text = settings.text_color || DEFAULT_APP_SETTINGS.text_color

  return {
    appName: settings.app_name || DEFAULT_APP_SETTINGS.app_name,
    logoUrl: settings.logo_url,
    faviconUrl: settings.favicon_url,
    colors: {
      primary: settings.primary_color,
      secondary: settings.secondary_color,
      accent,
      accentHover: darkenHex(accent),
      background: settings.background_color,
      surface: settings.surface_color ?? '#FFFFFF',
      text,
      textMuted: lightenHex(text, 0.45),
      border: lightenHex(settings.secondary_color, 0.15),
      white: '#FFFFFF',
      cream: settings.background_color,
      warm: settings.secondary_color,
      brown: text,
      brownMuted: lightenHex(text, 0.45),
      danger: '#B42318',
      success: '#2D6A4F',
    },
    radii: {
      button: parseRadius(settings.button_radius),
      card: parseRadius(settings.card_radius),
    },
    fonts: {
      heading: resolveFontFamily(settings.heading_font, 'heading'),
      body: resolveFontFamily(settings.body_font, 'body'),
    },
  }
}

export const DEFAULT_APP_THEME = settingsToTheme(DEFAULT_APP_SETTINGS)
