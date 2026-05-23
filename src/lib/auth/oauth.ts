import * as QueryParams from 'expo-auth-session/build/QueryParams'
import { makeRedirectUri } from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { supabase, SUPABASE_NOT_CONFIGURED_MESSAGE } from '@/lib/supabase/client'

WebBrowser.maybeCompleteAuthSession()

/** Redirect URI — add this exact value in Supabase → Auth → URL Configuration → Redirect URLs */
export function getOAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'mobile',
    path: 'auth/callback',
  })
}

export async function createSessionFromOAuthUrl(url: string): Promise<string | null> {
  if (!supabase) return 'Supabase is not configured'

  const { params, errorCode } = QueryParams.getQueryParams(url)
  if (errorCode) {
    return decodeURIComponent(errorCode)
  }

  const errorDescription = params.error_description
  if (params.error) {
    return errorDescription
      ? decodeURIComponent(errorDescription)
      : decodeURIComponent(params.error)
  }

  if (params.code) {
    const { error } = await supabase.auth.exchangeCodeForSession(params.code)
    return error?.message ?? null
  }

  const accessToken = params.access_token
  const refreshToken = params.refresh_token
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    return error?.message ?? null
  }

  return 'Autentificarea Google nu s-a finalizat. Încearcă din nou.'
}

export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  if (!supabase) {
    return { error: SUPABASE_NOT_CONFIGURED_MESSAGE }
  }

  const redirectTo = getOAuthRedirectUri()

  if (__DEV__) {
    console.log('[Supabase OAuth] redirectTo:', redirectTo)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (!data?.url) {
    return { error: 'Nu s-a putut deschide autentificarea Google.' }
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  })

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { error: null }
  }

  if (result.type !== 'success') {
    return { error: 'Autentificarea Google a fost întreruptă.' }
  }

  const sessionError = await createSessionFromOAuthUrl(result.url)
  return { error: sessionError }
}
