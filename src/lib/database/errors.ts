export function toUserMessage(error: unknown): string {
  if (!error) return 'Ceva nu a mers bine. Încearcă din nou.'

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = String((error as { message: string }).message)
    if (msg.includes('JWT')) return 'Sesiune expirată. Autentifică-te din nou.'
    if (msg.includes('permission') || msg.includes('RLS')) {
      return 'Nu ai permisiunea pentru această acțiune.'
    }
    return msg
  }

  if (error instanceof Error) return error.message
  return 'Ceva nu a mers bine. Încearcă din nou.'
}
