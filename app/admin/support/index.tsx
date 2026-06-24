import { useRouter } from 'expo-router'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { Button } from '@/components/ui/Button'
import { useAdminSupportInbox } from '@/hooks/use-admin-support'
import { formatMessageTime } from '@/lib/format/date'
import { supportThreadStatusLabels } from '@/lib/support/status-labels'
import { colors } from '@/theme/colors'
import type { SupportThreadWithClient } from '@/lib/support/types'

function ThreadRow({
  thread,
  onPress,
}: {
  thread: SupportThreadWithClient
  onPress: () => void
}) {
  const label =
    thread.client_name?.trim() || thread.client_email || 'Client necunoscut'
  const activityAt = thread.last_message_at ?? thread.updated_at

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.88 }]}
    >
      <View style={styles.rowTop}>
        <Text style={styles.name} numberOfLines={1}>
          {label}
        </Text>
        {thread.unread_for_admin ? <View style={styles.dot} /> : null}
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{supportThreadStatusLabels[thread.status]}</Text>
        <Text style={styles.time}>{formatMessageTime(activityAt)}</Text>
      </View>
      {thread.last_message_sender === 'ai' && !thread.unread_for_admin ? (
        <Text style={styles.aiTag}>Ultimul răspuns: AI</Text>
      ) : null}
      {thread.last_message_preview ? (
        <Text style={styles.preview} numberOfLines={2}>
          {thread.last_message_preview}
        </Text>
      ) : (
        <Text style={styles.previewMuted}>Niciun mesaj încă</Text>
      )}
    </Pressable>
  )
}

export default function AdminSupportInboxScreen() {
  const router = useRouter()
  const { threads, pendingEscalations, unreadCount, loading, refreshing, error, refetch } =
    useAdminSupportInbox()

  return (
    <Screen scroll={false} padded={false}>
      {(unreadCount > 0 || pendingEscalations.length > 0) && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {unreadCount > 0
              ? `${unreadCount} conversații cu mesaje necitite`
              : `${pendingEscalations.length} conversații escaladate de la AI`}
          </Text>
        </View>
      )}

      {error && threads.length === 0 ? (
        <View style={styles.errorBlock}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch(false)} />
        </View>
      ) : error ? (
        <Text style={styles.errorInline}>{error}</Text>
      ) : null}

      {loading && threads.length === 0 ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : threads.length === 0 ? (
        <EmptyState
          title="Inbox gol"
          description="Conversațiile clienților vor apărea aici în timp real."
        />
      ) : (
        <FlatList
          data={threads}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThreadRow
              thread={item}
              onPress={() => router.push(`/admin/support/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => void refetch(true)}
        />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  row: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.brown },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    gap: 8,
  },
  meta: { fontSize: 12, color: colors.brownMuted },
  time: { fontSize: 11, color: colors.brownMuted },
  aiTag: { fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 6 },
  preview: { fontSize: 14, color: colors.brown, marginTop: 8, lineHeight: 20 },
  previewMuted: { fontSize: 13, color: colors.brownMuted, marginTop: 8, fontStyle: 'italic' },
  error: { padding: 12, color: colors.danger, fontSize: 14 },
  errorInline: { padding: 12, color: colors.danger, fontSize: 13 },
  errorBlock: { padding: 16, gap: 10 },
  banner: {
    margin: 12,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF0EB',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  bannerText: { fontSize: 13, fontWeight: '600', color: colors.brown },
  loader: { marginTop: 32 },
})
