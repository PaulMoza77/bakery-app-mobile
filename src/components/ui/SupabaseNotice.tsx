import { StyleSheet, Text, View } from 'react-native'
import {
  SUPABASE_NOT_CONFIGURED_MESSAGE,
  supabaseConfigError,
} from '@/lib/supabase/client'
import { colors } from '@/theme/colors'

export function SupabaseNotice() {
  const message = supabaseConfigError ?? SUPABASE_NOT_CONFIGURED_MESSAGE

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Supabase nu este configurat</Text>
      <Text style={styles.body}>{message}</Text>
      <Text style={styles.hint}>
        Copiază valorile din Supabase Dashboard → Project Settings → API, sau din
        .env.local al aplicației web (redenumește VITE_SUPABASE_* în EXPO_PUBLIC_SUPABASE_*).
        Repornește cu npx expo start --clear.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFF4E5',
    borderWidth: 1,
    borderColor: '#F5D9A8',
    marginBottom: 16,
  },
  title: { fontWeight: '700', color: colors.brown, marginBottom: 4 },
  body: { fontSize: 14, color: colors.brownMuted, lineHeight: 20 },
  hint: { fontSize: 12, color: colors.brownMuted, marginTop: 8, lineHeight: 18 },
})
