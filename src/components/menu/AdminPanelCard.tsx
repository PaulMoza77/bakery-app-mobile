import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

interface AdminPanelCardProps {
  onPress: () => void
}

export function AdminPanelCard({ onPress }: AdminPanelCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Panou admin"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="shield-checkmark" size={24} color={colors.white} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Panou admin</Text>
        <Text style={styles.desc}>Produse, comenzi, torturi și setări magazin</Text>
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
    borderColor: colors.accent,
    marginTop: 4,
    marginBottom: 12,
    shadowColor: colors.brown,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  label: { fontSize: 17, fontWeight: '700', color: colors.brown },
  desc: { fontSize: 13, color: colors.brownMuted, marginTop: 4, lineHeight: 18 },
})
