import { useRouter } from 'expo-router'
import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { AuthDivider } from '@/components/auth/AuthDivider'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { getPostLoginPath } from '@/lib/auth/redirect'
import { colors } from '@/theme/colors'

export default function RegisterScreen() {
  const { signUp, isConfigured, role } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [emailConfirm, setEmailConfirm] = useState(false)

  function goAfterAuth(signedInRole: typeof role) {
    router.replace(getPostLoginPath(signedInRole ?? role) as never)
  }

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    const { error: signUpError, role: signedUpRole } = await signUp(email, password, fullName)
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError)
      return
    }
    if (!signedUpRole) {
      setEmailConfirm(true)
      return
    }
    goAfterAuth(signedUpRole)
  }

  if (emailConfirm) {
    return (
      <Screen>
        <Text style={styles.title}>Verifică emailul</Text>
        <Text style={styles.sub}>
          Ți-am trimis un link de confirmare. După activare, te poți autentifica.
        </Text>
        <Button title="Mergi la autentificare" onPress={() => router.replace('/(auth)/login')} />
      </Screen>
    )
  }

  return (
    <Screen>
      {!isConfigured && <SupabaseNotice />}
      <Text style={styles.title}>Înregistrare</Text>
      <Text style={styles.sub}>Creează un cont pentru comenzi și profil.</Text>

      <GoogleSignInButton
        disabled={submitting}
        onSuccess={(signedInRole) => goAfterAuth(signedInRole)}
      />
      <AuthDivider />

      <Input label="Nume complet" value={fullName} onChangeText={setFullName} />
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label="Parolă"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={error}
      />
      <Button title="Creează cont" onPress={() => void handleSubmit()} loading={submitting} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ai deja cont? </Text>
        <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>
          Autentificare
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.brown },
  sub: { fontSize: 14, color: colors.brownMuted, marginBottom: 8, marginTop: 6, lineHeight: 20 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.brownMuted },
  link: { color: colors.accent, fontWeight: '600' },
})
