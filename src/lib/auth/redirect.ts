import type { UserRole } from '@/types/auth'

export function getPostLoginPath(
  role: UserRole | null,
  fromPath?: string,
): string {
  if (
    fromPath &&
    fromPath !== '/login' &&
    fromPath !== '/register' &&
    !fromPath.startsWith('/(auth)')
  ) {
    return fromPath
  }
  if (role === 'admin') return '/admin'
  return '/(tabs)'
}
