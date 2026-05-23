import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
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
import { EmptyState } from '@/components/ui/EmptyState'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useSupportChat } from '@/hooks/use-support-chat'
import { useSupportUnread } from '@/hooks/use-support-unread'
import { supportThreadStatusLabels } from '@/lib/support/status-labels'
import { colors } from '@/theme/colors'

export default function ChatScreen() {
  const router = useRouter()
  const { user, isConfigured } = useAuth()
  const {
    thread,
    loading,
    sending,
    error,
    sendMessage,
    startNewConversation,
    hasUnreadFromTeam,
    isDemoMode,
    refetch,
  } = useSupportChat()
  const { refresh: refreshUnread } = useSupportUnread()

  useFocusEffect(
    useCallback(() => {
      return () => {
        void refreshUnread()
      }
    }, [refreshUnread]),
  )

  if (!isConfigured) {
    return (
      <View style={styles.root}>
        <SupabaseNotice />
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.root}>
        <EmptyState
          title="Autentificare necesară"
          description="Conectează-te pentru a trimite mesaje echipei."
        />
        <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
      </View>
    )
  }

  const closed = thread?.status === 'closed'

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={88}
    >
      {isDemoMode && (
        <Text style={styles.demoBanner}>Mod local — mesajele nu sunt salvate în cloud.</Text>
      )}

      {thread && (
        <View style={styles.statusBar}>
          <Text style={styles.status}>
            {supportThreadStatusLabels[thread.status]}
            {thread.ai_failed ? ' · escaladat' : ''}
          </Text>
          {hasUnreadFromTeam && (
            <Text style={styles.unreadBadge}>Răspuns nou</Text>
          )}
          {closed && (
            <Button
              title="Conversație nouă"
              variant="secondary"
              onPress={() => void startNewConversation()}
            />
          )}
        </View>
      )}

      {error ? (
        <View style={styles.errorBlock}>
          <Text style={styles.error}>{error}</Text>
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </View>
      ) : null}

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
            placeholder={
              closed ? 'Conversația este închisă' : 'Întreabă despre comenzi, livrare…'
            }
          />
        </>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  demoBanner: {
    padding: 10,
    fontSize: 12,
    color: colors.brownMuted,
    textAlign: 'center',
    backgroundColor: colors.warm,
  },
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
  status: { fontSize: 13, fontWeight: '600', color: colors.brown },
  unreadBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  error: {
    fontSize: 14,
    color: '#B42318',
  },
  errorBlock: { padding: 12, gap: 8 },
  loader: { marginTop: 40 },
  messages: { flex: 1 },
})
