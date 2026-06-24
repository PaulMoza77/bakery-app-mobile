import { useRef, useEffect } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'
import { formatMessageTime } from '@/lib/format/date'
import type { OptimisticSupportMessage } from '@/lib/support/message-utils'

interface SupportMessageListProps {
  messages: OptimisticSupportMessage[]
  onRetryFailed?: (text: string) => void
}

function senderLabel(senderType: OptimisticSupportMessage['sender_type']): string {
  if (senderType === 'client') return 'Tu'
  if (senderType === 'admin') return 'Echipă'
  return 'Asistent AI'
}

function MessageBubble({
  message,
  onRetryFailed,
}: {
  message: OptimisticSupportMessage
  onRetryFailed?: (text: string) => void
}) {
  const { colors: c } = useAppTheme()
  const isClient = message.sender_type === 'client'
  const failed = message.failed

  const bubble = (
    <View
      style={[
        styles.bubble,
        isClient
          ? {
              backgroundColor: c.accent,
              borderColor: c.accent,
              borderBottomRightRadius: 6,
            }
          : {
              backgroundColor: c.surface,
              borderColor: c.border,
              borderBottomLeftRadius: 6,
            },
        failed && { borderColor: c.danger },
        message.pending && styles.bubblePending,
      ]}
    >
      <Text
        style={[
          styles.sender,
          { color: isClient ? 'rgba(255,255,255,0.85)' : c.textMuted },
        ]}
      >
        {senderLabel(message.sender_type)}
      </Text>
      <Text
        style={[styles.body, { color: isClient ? c.white : c.text }]}
      >
        {message.message}
      </Text>
      <Text
        style={[
          styles.time,
          { color: isClient ? 'rgba(255,255,255,0.75)' : c.textMuted },
        ]}
      >
        {message.pending ? 'Se trimite…' : formatMessageTime(message.created_at)}
        {failed ? ' · Nu s-a trimis' : ''}
      </Text>
      {failed ? (
        <Text style={[styles.retry, { color: c.danger }]}>Apasă pentru reîncercare</Text>
      ) : null}
    </View>
  )

  if (failed && onRetryFailed) {
    return (
      <View style={[styles.row, styles.rowClient]}>
        <Pressable onPress={() => onRetryFailed(message.message)}>{bubble}</Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.row, isClient ? styles.rowClient : styles.rowOther]}>
      {bubble}
    </View>
  )
}

export function SupportMessageList({
  messages,
  onRetryFailed,
}: SupportMessageListProps) {
  const { colors: c } = useAppTheme()
  const listRef = useRef<FlatList<OptimisticSupportMessage>>(null)

  useEffect(() => {
    if (messages.length === 0) return
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true })
    }, 80)
    return () => clearTimeout(timer)
  }, [messages.length, messages.at(-1)?.id, messages.at(-1)?.pending])

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyTitle, { color: c.text }]}>
          Bun venit la suport
        </Text>
        <Text style={[styles.emptyText, { color: c.textMuted }]}>
          Scrie prima întrebare — echipa noastră îți răspunde aici, în timp real.
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageBubble message={item} onRetryFailed={onRetryFailed} />
      )}
      contentContainerStyle={styles.list}
      keyboardShouldPersistTaps="handled"
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 16, paddingBottom: 8, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', padding: 28 },
  emptyTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
  },
  row: { marginBottom: 10 },
  rowClient: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  bubblePending: { opacity: 0.75 },
  sender: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  body: { fontSize: 15, lineHeight: 21 },
  time: { fontSize: 10, marginTop: 6 },
  retry: { fontSize: 11, marginTop: 6, fontWeight: '600' },
})
