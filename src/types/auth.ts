export type UserRole = 'client' | 'admin'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}
