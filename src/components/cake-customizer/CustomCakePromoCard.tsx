import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

interface CustomCakePromoCardProps {
  onPress: () => void
}

export function CustomCakePromoCard({ onPress }: CustomCakePromoCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Torturi personalizate"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="layers-outline" size={26} color={colors.white} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Torturi personalizate</Text>
        <Text style={styles.desc}>
          Configurează pas cu pas: etaje, blat, cremă și decor — vezi prețul estimativ.
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={22} color={colors.accent} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    shadowColor: colors.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { fontSize: 17, fontWeight: '700', color: colors.brown },
  desc: { fontSize: 13, color: colors.brownMuted, marginTop: 4, lineHeight: 18 },
})
