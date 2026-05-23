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
      <Text style={styles.meta}>
        {supportThreadStatusLabels[thread.status]}
        {thread.ai_failed ? ' · AI eșuat' : ''}
      </Text>
      {thread.last_message_preview ? (
        <Text style={styles.preview} numberOfLines={2}>
          {thread.last_message_preview}
        </Text>
      ) : null}
    </Pressable>
  )
}

export default function AdminSupportInboxScreen() {
  const router = useRouter()
  const { threads, loading, refreshing, error, refetch } = useAdminSupportInbox()
  const escalatedCount = threads.filter((t) => t.ai_failed || t.status === 'escalated').length

  return (
    <Screen scroll={false} padded={false}>
      {escalatedCount > 0 && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            {escalatedCount} conversații escaladate necesită atenție
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
          description="Conversațiile clienților vor apărea aici."
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
    borderRadius: 14,
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
  meta: { fontSize: 12, color: colors.brownMuted, marginTop: 4 },
  preview: { fontSize: 14, color: colors.brown, marginTop: 8, lineHeight: 20 },
  error: { padding: 12, color: '#B42318', fontSize: 14 },
  errorInline: { padding: 12, color: '#B42318', fontSize: 13 },
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
