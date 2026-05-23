import { Pressable, StyleSheet, Text, View } from 'react-native'
import { notificationCategoryLabel } from '@/lib/notifications/category-labels'
import { formatDateTime } from '@/lib/format/date'
import { colors } from '@/theme/colors'
import type { NotificationListItem as Item } from '@/hooks/use-notifications'

interface NotificationListItemProps {
  item: Item
  onOpen: (id: string) => void
}

export function NotificationListItem({ item, onOpen }: NotificationListItemProps) {
  return (
    <Pressable
      onPress={() => onOpen(item.id)}
      style={({ pressed }) => [
        styles.card,
        item.is_unread && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, item.is_unread && styles.titleUnread]}>
          {item.title}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{notificationCategoryLabel(item.category)}</Text>
        </View>
      </View>
      <Text style={styles.body} numberOfLines={4}>
        {item.body}
      </Text>
      <Text style={styles.time}>{formatDateTime(item.created_at)}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    padding: 14,
    marginBottom: 10,
  },
  cardUnread: {
    borderColor: '#E8C4B8',
    backgroundColor: '#FFF8F5',
  },
  cardPressed: { opacity: 0.9 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.brown,
  },
  titleUnread: { color: colors.brown },
  body: {
    fontSize: 14,
    color: colors.brownMuted,
    lineHeight: 20,
  },
  time: {
    marginTop: 8,
    fontSize: 12,
    color: colors.brownMuted,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: colors.warm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brownMuted,
    textTransform: 'uppercase',
  },
})
