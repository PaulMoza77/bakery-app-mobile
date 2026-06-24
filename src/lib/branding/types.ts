import type { AppSettingsRow } from '@/types/database'

export type AppSettingsUpdate = Omit<
  AppSettingsRow,
  'id' | 'created_at' | 'updated_at'
>

export type { AppSettingsRow }
