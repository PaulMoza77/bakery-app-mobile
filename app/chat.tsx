import { useRouter, useFocusEffect } from 'expo-router'
import { useCallback } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SupportChatHeader } from '@/components/support/SupportChatHeader'
import { SupportComposer } from '@/components/support/SupportComposer'
import { SupportMessageList } from '@/components/support/SupportMessageList'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAppTheme } from '@/contexts/BrandingContext'
import { useAuth } from '@/contexts/AuthContext'
import { useSupportChat } from '@/hooks/use-support-chat'
import { useSupportUnread } from '@/hooks/use-support-unread'
import { supportThreadStatusLabels } from '@/lib/support/status-labels'

const SUBTITLE = 'Asistent AI activ · echipa preia când e nevoie'

export default function ChatScreen() {
  const router = useRouter()
  const theme = useAppTheme()
  const { user, isConfigured } = useAuth()
  const {
    thread,
    loading,
    sending,
    loadError,
    sendError,
    aiNotice,
    retryText,
    sendMessage,
    startNewConversation,
    hasUnreadFromTeam,
    aiAssistantActive,
    refetch,
  } = useSupportChat({ notifyWhenBackground: false })
  const { refresh: refreshUnread } = useSupportUnread()

  useFocusEffect(
    useCallback(() => {
      void refetch()
      return () => {
        void refreshUnread()
      }
    }, [refetch, refreshUnread]),
  )

  const styles = makeStyles(theme)

  if (!isConfigured) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <SupportChatHeader subtitle={SUBTITLE} />
        <SupabaseNotice />
      </SafeAreaView>
    )
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <SupportChatHeader subtitle={SUBTITLE} />
        <View style={styles.centered}>
          <EmptyState
            title="Autentificare necesară"
            description="Conectează-te pentru a trimite mesaje echipei."
          />
          <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
        </View>
      </SafeAreaView>
    )
  }

  const closed = thread?.status === 'closed'

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <SupportChatHeader subtitle={SUBTITLE} />

      {thread && thread.id !== 'pending' ? (
        <View style={styles.statusBar}>
          <Text style={styles.status}>
            {supportThreadStatusLabels[thread.status]}
            {hasUnreadFromTeam ? ' · Răspuns nou' : ''}
          </Text>
          {closed ? (
            <Button
              title="Conversație nouă"
              variant="secondary"
              onPress={() => void startNewConversation()}
            />
          ) : null}
        </View>
      ) : null}

      {loadError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{loadError}</Text>
          <Pressable onPress={() => void refetch()} hitSlop={8}>
            <Text style={styles.bannerAction}>Reîncarcă</Text>
          </Pressable>
        </View>
      ) : null}

      {sendError ? (
        <View style={[styles.banner, styles.bannerDanger]}>
          <Text style={styles.bannerText}>{sendError}</Text>
        </View>
      ) : null}

      {aiNotice ? (
        <View style={styles.aiNotice}>
          <Text style={styles.aiNoticeText}>{aiNotice}</Text>
        </View>
      ) : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 4 : 0}
      >
        {loading ? (
          <ActivityIndicator style={styles.loader} color={theme.colors.accent} />
        ) : (
          <>
            <View style={styles.messages}>
              <SupportMessageList
                messages={thread?.messages ?? []}
                onRetryFailed={(text) => void sendMessage(text)}
              />
            </View>
            <SupportComposer
              onSend={sendMessage}
              sending={sending}
              sendingLabel={
                aiAssistantActive && sending ? 'Asistentul gândește…' : undefined
              }
              disabled={closed}
              retryText={retryText}
              placeholder={
                closed ? 'Conversația este închisă' : 'Întreabă despre comenzi, livrare…'
              }
            />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function makeStyles(theme: ReturnType<typeof useAppTheme>) {
  const c = theme.colors
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.background },
    flex: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', padding: 16 },
    statusBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: c.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    status: { fontSize: 11, fontWeight: '600', color: c.textMuted },
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginHorizontal: 12,
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: c.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    bannerDanger: {
      borderColor: c.danger,
      backgroundColor: `${c.danger}12`,
    },
    bannerText: { flex: 1, fontSize: 12, lineHeight: 16, color: c.text },
    bannerAction: { fontSize: 12, fontWeight: '700', color: c.accent },
    aiNotice: {
      marginHorizontal: 12,
      marginTop: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: `${c.accent}14`,
    },
    aiNoticeText: { fontSize: 12, lineHeight: 16, color: c.textMuted },
    loader: { marginTop: 40 },
    messages: { flex: 1 },
  })
}
