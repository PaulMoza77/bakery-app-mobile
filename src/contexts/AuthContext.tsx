import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { signInWithGoogleOAuth, createSessionFromOAuthUrl } from '@/lib/auth/oauth'
import { isAdminRole } from '@/lib/auth/profile-role'
import {
  fetchResolvedProfileForUser,
  resolveProfileForUser,
} from '@/lib/database/queries/profile'
import {
  isSupabaseConfigured,
  supabase,
  supabaseConfigError,
  SUPABASE_NOT_CONFIGURED_MESSAGE,
} from '@/lib/supabase/client'
import type { Profile, UserRole } from '@/types/auth'
import * as Linking from 'expo-linking'

interface AuthResult {
  error: string | null
  role: UserRole | null
}

interface AuthContextValue {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole | null
  isAdmin: boolean
  isClient: boolean
  loading: boolean
  profileLoading: boolean
  profileError: string | null
  roleResolved: boolean
  isConfigured: boolean
  configError: string | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signInWithGoogle: () => Promise<{
    error: string | null
    cancelled?: boolean
    role: UserRole | null
  }>
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<AuthResult>
  signOut: () => Promise<void>
  refreshProfile: (silent?: boolean) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const notConfiguredResult: AuthResult = {
  error: supabaseConfigError ?? SUPABASE_NOT_CONFIGURED_MESSAGE,
  role: null,
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [roleResolved, setRoleResolved] = useState(false)

  const applySession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession)
    const nextUser = nextSession?.user ?? null
    setUser(nextUser)

    if (!nextUser) {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      setRoleResolved(true)
      return null
    }

    setProfileLoading(true)
    setRoleResolved(false)
    setProfileError(null)

    const { profile: nextProfile, error: nextProfileError } =
      await resolveProfileForUser(nextUser)
    setProfile(nextProfile)
    setProfileError(nextProfileError)
    setProfileLoading(false)
    setRoleResolved(true)

    return nextProfile?.role ?? null
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      setProfileLoading(false)
      setRoleResolved(true)
      return
    }

    const client = supabase
    let mounted = true

    function handleDeepLink(event: { url: string }) {
      if (!event.url.includes('access_token') && !event.url.includes('code=')) {
        return
      }
      void createSessionFromOAuthUrl(event.url).then((err) => {
        if (err && __DEV__) console.warn('[Supabase OAuth]', err)
      })
    }

    const linkSub = Linking.addEventListener('url', handleDeepLink)
    void Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url })
    })

    client.auth.getSession().then(({ data }) => {
      if (!mounted) return
      void applySession(data.session).finally(() => {
        if (mounted) setLoading(false)
      })
    })

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      void applySession(nextSession).finally(() => {
        if (mounted) setLoading(false)
      })
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      linkSub.remove()
    }
  }, [applySession])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: supabaseConfigError ?? SUPABASE_NOT_CONFIGURED_MESSAGE,
        role: null,
      }
    }

    const result = await signInWithGoogleOAuth()
    if (result.error) {
      return { error: result.error, role: null }
    }

    const { data } = await supabase.auth.getSession()
    if (data.session) {
      const userRole = await applySession(data.session)
      return { error: null, cancelled: false, role: userRole }
    }

    return { error: null, cancelled: true, role: null }
  }, [applySession])

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!isSupabaseConfigured || !supabase) return notConfiguredResult

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { error: error.message, role: null }

      const role = await applySession(data.session)
      return { error: null, role }
    },
    [applySession],
  )

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<AuthResult> => {
      if (!isSupabaseConfigured || !supabase) return notConfiguredResult

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) return { error: error.message, role: null }

      if (data.session) {
        const role = await applySession(data.session)
        return { error: null, role: role ?? null }
      }

      return { error: null, role: null }
    },
    [applySession],
  )

  const signOut = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut()
    }
    setSession(null)
    setUser(null)
    setProfile(null)
    setProfileError(null)
    setProfileLoading(false)
    setRoleResolved(true)
  }, [])

  const refreshProfile = useCallback(
    async (silent = false) => {
      if (!session?.user) return
      if (!silent) {
        setProfileLoading(true)
        setRoleResolved(false)
      }
      const { profile: nextProfile, error: nextProfileError } =
        await fetchResolvedProfileForUser(session.user)
      setProfile(nextProfile)
      setProfileError(nextProfileError)
      if (!silent) setProfileLoading(false)
      setRoleResolved(true)
    },
    [session],
  )

  const role = profile?.role ?? null

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      role,
      isAdmin: isAdminRole(role),
      isClient: role === 'client',
      loading,
      profileLoading,
      profileError,
      roleResolved,
      isConfigured: isSupabaseConfigured,
      configError: supabaseConfigError,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      role,
      loading,
      profileLoading,
      profileError,
      roleResolved,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      refreshProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
