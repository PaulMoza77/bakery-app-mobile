import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/theme/colors'
import type { UserRole } from '@/types/auth'

interface GoogleSignInButtonProps {
  disabled?: boolean
  onSuccess?: (role: UserRole | null) => void
}

export function GoogleSignInButton({ disabled, onSuccess }: GoogleSignInButtonProps) {
  const { signInWithGoogle, isConfigured, configError } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePress() {
    setError(null)
    setLoading(true)
    const { error: oauthError, cancelled, role } = await signInWithGoogle()
    setLoading(false)
    if (oauthError) {
      setError(oauthError)
      return
    }
    if (!cancelled) {
      onSuccess?.(role)
    }
  }

  const isDisabled = disabled || loading || !isConfigured

  return (
    <View style={styles.wrap}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isConfigured && configError ? (
        <Text style={styles.hint}>{configError}</Text>
      ) : null}
      <Pressable
        onPress={() => void handlePress()}
        disabled={isDisabled}
        style={({ pressed }) => [
          styles.button,
          isDisabled && styles.buttonDisabled,
          pressed && !isDisabled && styles.buttonPressed,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={colors.brown} />
        ) : (
          <>
            <Text style={styles.icon}>G</Text>
            <Text style={styles.label}>Continuă cu Google</Text>
          </>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.85 },
  icon: {
    width: 22,
    height: 22,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '800',
    color: '#4285F4',
    fontSize: 16,
  },
  label: { fontSize: 16, fontWeight: '600', color: colors.brown },
  error: { color: colors.danger, fontSize: 13, marginBottom: 8 },
  hint: { color: colors.brownMuted, fontSize: 13, marginBottom: 8, lineHeight: 18 },
})
