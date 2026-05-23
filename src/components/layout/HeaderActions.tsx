import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useHeaderBadges } from '@/hooks/use-header-badges'
import { colors } from '@/theme/colors'

type IconName = keyof typeof Ionicons.glyphMap

interface ActionIconProps {
  name: IconName
  label: string
  badge?: number
  onPress: () => void
}

function ActionIcon({ name, label, badge, onPress }: ActionIconProps) {
  const showBadge = badge != null && badge > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
    >
      <Ionicons name={name} size={20} color={colors.brown} />
      {showBadge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  )
}

export function HeaderActions() {
  const router = useRouter()
  const { chatUnread, notificationsUnread, cartCount } = useHeaderBadges()

  return (
    <View style={styles.row}>
      <ActionIcon
        name="chatbubble-ellipses-outline"
        label="Chat"
        badge={chatUnread}
        onPress={() => router.push('/chat')}
      />
      <ActionIcon
        name="bag-outline"
        label="Coș"
        badge={cartCount}
        onPress={() => router.push('/cart')}
      />
      <ActionIcon
        name="notifications-outline"
        label="Notificări"
        badge={notificationsUnread}
        onPress={() => router.push('/notifications')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconBtnPressed: { opacity: 0.75, backgroundColor: colors.warm },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
})
