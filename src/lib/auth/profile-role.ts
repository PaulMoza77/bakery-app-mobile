import type { Profile, UserRole } from '@/types/auth'

export function normalizeUserRole(role: unknown): UserRole {
  const value = String(role ?? '')
    .trim()
    .toLowerCase()
  return value === 'admin' ? 'admin' : 'client'
}

export function normalizeProfile(profile: Profile): Profile {
  return {
    ...profile,
    role: normalizeUserRole(profile.role),
  }
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === 'admin'
}
