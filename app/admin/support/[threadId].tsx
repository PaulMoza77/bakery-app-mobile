import { useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SupportComposer } from '@/components/support/SupportComposer'
import { SupportMessageList } from '@/components/support/SupportMessageList'
import { Button } from '@/components/ui/Button'
import { useAdminSupportThread } from '@/hooks/use-admin-support'
import { supportThreadStatusLabels } from '@/lib/support/status-labels'
import { colors } from '@/theme/colors'

export default function AdminSupportThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>()
  const id = typeof threadId === 'string' ? threadId : threadId?.[0]

  const {
    thread,
    loading,
    sending,
    error,
    sendMessage,
    joinConversation,
    closeConversation,
  } = useAdminSupportThread(id)

  const closed = thread?.status === 'closed'
  const needsJoin = thread && !thread.assigned_admin_id && thread.status !== 'closed'

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      {thread && (
        <View style={styles.statusBar}>
          <Text style={styles.status}>
            {supportThreadStatusLabels[thread.status]}
          </Text>
          {needsJoin ? (
            <Button
              title="Preia conversația"
              variant="secondary"
              onPress={() => void joinConversation()}
            />
          ) : null}
          {!closed && (
            <Button
              title="Închide"
              variant="ghost"
              onPress={() => void closeConversation()}
            />
          )}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} color={colors.accent} />
      ) : (
        <>
          <View style={styles.messages}>
            <SupportMessageList messages={thread?.messages ?? []} />
          </View>
          <SupportComposer
            onSend={sendMessage}
            sending={sending}
            disabled={closed}
            placeholder={closed ? 'Conversație închisă' : 'Răspunde clientului…'}
          />
        </>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  statusBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  status: { fontSize: 13, fontWeight: '600', color: colors.brown, marginRight: 'auto' },
  error: { padding: 12, fontSize: 14, color: '#B42318' },
  loader: { marginTop: 40 },
  messages: { flex: 1 },
})
