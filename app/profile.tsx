import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/theme/colors'

export default function ProfileScreen() {
  const { user, profile, profileLoading, profileError, refreshProfile, signOut, loading } =
    useAuth()
  const router = useRouter()

  if (loading || profileLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  if (!user) {
    return (
      <Screen>
        <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
      </Screen>
    )
  }

  return (
    <Screen>
      {profileError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{profileError}</Text>
          <Button title="Reîncearcă" variant="secondary" onPress={() => void refreshProfile()} />
        </View>
      ) : null}

      <Card>
        <Text style={styles.label}>Nume</Text>
        <Text style={styles.value}>{profile?.full_name ?? '—'}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Text style={styles.label}>Telefon</Text>
        <Text style={styles.value}>{profile?.phone ?? '—'}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{profile?.role ?? 'client'}</Text>
      </Card>
      <View style={{ marginTop: 16 }}>
        <Button title="Deconectare" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', color: colors.brownMuted, marginTop: 12 },
  value: { fontSize: 16, color: colors.brown, marginTop: 4 },
  errorBanner: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    gap: 8,
  },
  errorText: { fontSize: 14, color: colors.danger, lineHeight: 20 },
})
