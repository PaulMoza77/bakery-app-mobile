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

export default function LoginScreen() {
  const { signIn, isConfigured, role } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function goAfterAuth(signedInRole: typeof role) {
    router.replace(getPostLoginPath(signedInRole ?? role) as never)
  }

  async function handleSubmit() {
    setError(null)
    setSubmitting(true)
    const { error: signInError, role: signedInRole } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError(signInError)
      return
    }
    goAfterAuth(signedInRole)
  }

  return (
    <Screen>
      {!isConfigured && <SupabaseNotice />}
      <Text style={styles.title}>Autentificare</Text>
      <Text style={styles.sub}>Intră în cont pentru comenzi și profil.</Text>

      <GoogleSignInButton
        disabled={submitting}
        onSuccess={(signedInRole) => goAfterAuth(signedInRole)}
      />
      <AuthDivider />

      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
      />
      <Input
        label="Parolă"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password"
        error={error}
      />
      <Button title="Intră în cont" onPress={() => void handleSubmit()} loading={submitting} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Nu ai cont? </Text>
        <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>
          Înregistrare
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.brown },
  sub: { fontSize: 14, color: colors.brownMuted, marginBottom: 8, marginTop: 6 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { color: colors.brownMuted },
  link: { color: colors.accent, fontWeight: '600' },
})
