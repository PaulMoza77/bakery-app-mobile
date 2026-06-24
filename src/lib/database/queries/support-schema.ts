import type { SupportThreadRow, SupportMessageRow, SupportThreadStatus } from '@/types/database'

/** Base columns from initial support migration */
export const THREAD_COLUMNS_LEGACY =
  'id, user_id, status, assigned_admin_id, ai_failed, created_at, updated_at'

export const THREAD_COLUMNS_FULL = `${THREAD_COLUMNS_LEGACY}, client_last_read_at, admin_last_read_at, last_message_at, ai_enabled, ai_takeover`

export const MESSAGE_COLUMNS_LEGACY =
  'id, thread_id, sender_id, sender_type, message, created_at'

export const MESSAGE_COLUMNS_FULL = `${MESSAGE_COLUMNS_LEGACY}, is_ai`

export function isMissingColumn(
  error: string | null | undefined,
  column: string,
): boolean {
  if (!error) return false
  return error.includes(column) && error.includes('does not exist')
}

export function normalizeSupportThread(
  row: Partial<SupportThreadRow> & Record<string, unknown>,
): SupportThreadRow {
  const status = (row.status as SupportThreadStatus) ?? 'open'
  const updatedAt =
    (row.updated_at as string) ?? new Date().toISOString()

  return {
    id: row.id as string,
    user_id: row.user_id as string,
    status,
    assigned_admin_id: (row.assigned_admin_id as string | null) ?? null,
    ai_failed: Boolean(row.ai_failed ?? false),
    ai_enabled: row.ai_enabled !== undefined ? Boolean(row.ai_enabled) : true,
    ai_takeover: Boolean(row.ai_takeover ?? false),
    client_last_read_at: (row.client_last_read_at as string | null) ?? null,
    admin_last_read_at: (row.admin_last_read_at as string | null) ?? null,
    last_message_at:
      (row.last_message_at as string | null) ??
      (row.updated_at as string | null) ??
      null,
    created_at: (row.created_at as string) ?? updatedAt,
    updated_at: updatedAt,
  }
}

export function normalizeSupportMessage(
  row: Partial<SupportMessageRow> & Record<string, unknown>,
): SupportMessageRow {
  const senderType = row.sender_type as SupportMessageRow['sender_type']
  return {
    id: row.id as string,
    thread_id: row.thread_id as string,
    sender_id: (row.sender_id as string | null) ?? null,
    sender_type: senderType,
    message: row.message as string,
    is_ai:
      row.is_ai !== undefined
        ? Boolean(row.is_ai)
        : senderType === 'ai',
    created_at: (row.created_at as string) ?? new Date().toISOString(),
  }
}

export function shouldUseLegacyThreadColumns(
  error: string | null | undefined,
): boolean {
  if (!error) return false
  return (
    isMissingColumn(error, 'ai_enabled') ||
    isMissingColumn(error, 'ai_takeover') ||
    isMissingColumn(error, 'last_message_at') ||
    isMissingColumn(error, 'client_last_read_at') ||
    isMissingColumn(error, 'admin_last_read_at')
  )
}

export function shouldUseLegacyMessageColumns(
  error: string | null | undefined,
): boolean {
  if (!error) return false
  return isMissingColumn(error, 'is_ai')
}
