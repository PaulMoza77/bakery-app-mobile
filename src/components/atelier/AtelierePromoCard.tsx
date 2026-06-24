import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/theme/colors'

export function AtelierePromoCard() {
  const router = useRouter()

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => router.push('/(tabs)/workshops')}
      accessibilityRole="button"
      accessibilityLabel="Ateliere"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="school-outline" size={22} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Ateliere</Text>
        <Text style={styles.desc}>
          Evenimente live, workshop-uri video și rețete digitale.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.brownMuted} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: 16,
    marginBottom: 16,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.9 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0EB',
  },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 17, fontWeight: '700', color: colors.brown },
  desc: { marginTop: 4, fontSize: 13, lineHeight: 18, color: colors.brownMuted },
})
