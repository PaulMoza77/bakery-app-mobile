import { useLocalSearchParams } from 'expo-router'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
    retryText,
    sendMessage,
    joinConversation,
    closeConversation,
    reopenConversation,
  } = useAdminSupportThread(id)

  const closed = thread?.status === 'closed'
  const needsJoin = thread && !thread.assigned_admin_id && !closed

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      {thread && (
        <View style={styles.statusBar}>
          <Text style={styles.status}>
            {supportThreadStatusLabels[thread.status]}
            {thread.ai_enabled && !thread.ai_takeover && !thread.assigned_admin_id
              ? ' · AI activ'
              : ''}
          </Text>
          {needsJoin ? (
            <Button
              title="Preia conversația"
              variant="secondary"
              onPress={() => void joinConversation()}
            />
          ) : null}
          {closed ? (
            <Button
              title="Redeschide"
              variant="secondary"
              onPress={() => void reopenConversation()}
            />
          ) : (
            <Button
              title="Închide"
              variant="ghost"
              onPress={() => void closeConversation()}
            />
          )}
        </View>
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
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
              retryText={retryText}
              placeholder={closed ? 'Conversație închisă' : 'Răspunde clientului…'}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  flex: { flex: 1 },
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
  error: { padding: 12, fontSize: 14, color: colors.danger },
  loader: { marginTop: 40 },
  messages: { flex: 1 },
})
