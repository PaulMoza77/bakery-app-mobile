import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { NotificationListItem } from '@/components/notifications/NotificationListItem'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useNotificationsUnread } from '@/contexts/NotificationsUnreadContext'
import { useNotifications } from '@/hooks/use-notifications'
import { colors } from '@/theme/colors'

export default function NotificationsScreen() {
  const router = useRouter()
  const {
    items,
    unreadCount,
    loading,
    error,
    marking,
    markAllRead,
    openNotification,
    refetch,
    isConfigured,
    requiresAuth,
  } = useNotifications()
  const { refetch: refetchUnread } = useNotificationsUnread()

  useFocusEffect(
    useCallback(() => {
      void refetch()
      void refetchUnread()
    }, [refetch, refetchUnread]),
  )

  if (requiresAuth) {
    return (
      <Screen>
        <EmptyState
          title="Autentificare necesară"
          description="Conectează-te pentru a vedea notificările."
        />
        <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
      </Screen>
    )
  }

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.header}>
        {!isConfigured && (
          <View style={styles.notice}>
            <SupabaseNotice />
          </View>
        )}
        <Text style={styles.subtitle}>
          {unreadCount > 0
            ? `${unreadCount} necitite`
            : 'Mesaje de la echipă și oferte'}
        </Text>
        {unreadCount > 0 && (
          <Button
            title="Marchează toate citite"
            variant="ghost"
            onPress={() => void markAllRead()}
            loading={marking}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : error && items.length === 0 ? (
        <View style={styles.padded}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </View>
      ) : items.length === 0 ? (
        <View style={styles.padded}>
          <EmptyState
            title="Nicio notificare"
            description="Când primești oferte sau actualizări de comandă, le vei vedea aici."
          />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => void refetch()}
              tintColor={colors.accent}
            />
          }
          renderItem={({ item }) => (
            <NotificationListItem item={item} onOpen={openNotification} />
          )}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.cream,
  },
  notice: { marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    color: colors.brownMuted,
    marginBottom: 4,
  },
  padded: { padding: 16 },
  loader: { marginTop: 40 },
  list: { padding: 16, paddingBottom: 32 },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 14,
  },
})
