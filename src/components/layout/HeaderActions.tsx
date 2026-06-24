import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'
import { useHeaderBadges } from '@/hooks/use-header-badges'

type IconName = keyof typeof Ionicons.glyphMap

interface ActionIconProps {
  name: IconName
  label: string
  badge?: number
  onPress: () => void
}

function ActionIcon({ name, label, badge, onPress }: ActionIconProps) {
  const theme = useAppTheme()
  const showBadge = badge != null && badge > 0

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
        pressed && { opacity: 0.75, backgroundColor: theme.colors.warm },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
    >
      <Ionicons name={name} size={20} color={theme.colors.brown} />
      {showBadge ? (
        <View style={[styles.badge, { backgroundColor: theme.colors.accent, borderColor: theme.colors.white }]}>
          <Text style={[styles.badgeText, { color: theme.colors.white }]}>
            {badge > 99 ? '99+' : badge}
          </Text>
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
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
  },
})
