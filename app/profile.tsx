import { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/contexts/AuthContext'
import { useAppTheme } from '@/contexts/BrandingContext'
import { updateProfile } from '@/lib/database/queries/profile'

export default function ProfileScreen() {
  const {
    user,
    profile,
    profileLoading,
    profileError,
    refreshProfile,
    signOut,
    loading,
  } = useAuth()
  const theme = useAppTheme()
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  useEffect(() => {
    setFullName(profile?.full_name ?? '')
    setPhone(profile?.phone ?? '')
  }, [profile?.full_name, profile?.phone])

  const isDirty =
    fullName.trim() !== (profile?.full_name?.trim() ?? '') ||
    phone.trim() !== (profile?.phone?.trim() ?? '')

  async function handleSave() {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    setSaveMessage(null)

    const result = await updateProfile(user.id, {
      full_name: fullName.trim() || null,
      phone: phone.trim() || null,
    })

    setSaving(false)

    if (result.error || !result.data) {
      setSaveError(result.error ?? 'Salvarea a eșuat')
      return
    }

    setSaveMessage('Profilul a fost actualizat.')
    await refreshProfile(true)
  }

  if (loading || profileLoading) {
    return (
      <Screen>
        <ActivityIndicator color={theme.colors.accent} style={{ marginTop: 40 }} />
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

      {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
      {saveMessage ? (
        <Text style={[styles.saveOk, { color: theme.colors.success }]}>{saveMessage}</Text>
      ) : null}

      <Card>
        <Input
          label="Nume"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Numele tău"
          autoCapitalize="words"
        />
        <View style={styles.readOnlyField}>
          <Text style={[styles.fieldLabel, { color: theme.colors.brownMuted }]}>Email</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.brown }]}>{user.email}</Text>
          <Text style={[styles.fieldHint, { color: theme.colors.brownMuted }]}>
            Adresa de email este legată de autentificare și nu poate fi modificată aici.
          </Text>
        </View>
        <Input
          label="Telefon"
          value={phone}
          onChangeText={setPhone}
          placeholder="07xx xxx xxx"
          keyboardType="phone-pad"
        />
        <View style={styles.readOnlyField}>
          <Text style={[styles.fieldLabel, { color: theme.colors.brownMuted }]}>Rol</Text>
          <Text style={[styles.fieldValue, { color: theme.colors.brown }]}>
            {profile?.role ?? 'client'}
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Salvează modificările"
          onPress={() => void handleSave()}
          loading={saving}
          disabled={!isDirty || saving}
        />
        <Button title="Deconectare" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  readOnlyField: { marginBottom: 12 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  fieldValue: { fontSize: 16 },
  fieldHint: { fontSize: 12, marginTop: 6, lineHeight: 16 },
  actions: { gap: 10, marginTop: 16 },
  saveError: { color: '#B42318', marginBottom: 8, fontSize: 14 },
  saveOk: { marginBottom: 8, fontSize: 14, fontWeight: '600' },
  errorBanner: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    gap: 8,
  },
  errorText: { fontSize: 14, color: '#B42318', lineHeight: 20 },
})
