import { useRef, useEffect } from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'
import type { SupportMessageRow } from '@/types/database'

interface SupportMessageListProps {
  messages: SupportMessageRow[]
}

function senderLabel(senderType: SupportMessageRow['sender_type']): string {
  if (senderType === 'client') return 'Tu'
  if (senderType === 'admin') return 'Echipă'
  return 'Asistent'
}

function MessageBubble({ message }: { message: SupportMessageRow }) {
  const isClient = message.sender_type === 'client'
  return (
    <View style={[styles.row, isClient ? styles.rowClient : styles.rowOther]}>
      <View style={[styles.bubble, isClient ? styles.bubbleClient : styles.bubbleOther]}>
        <Text style={[styles.sender, isClient && styles.senderOnAccent]}>
          {senderLabel(message.sender_type)}
        </Text>
        <Text style={[styles.body, isClient && styles.bodyOnAccent]}>{message.message}</Text>
      </View>
    </View>
  )
}

export function SupportMessageList({ messages }: SupportMessageListProps) {
  const listRef = useRef<FlatList<SupportMessageRow>>(null)

  useEffect(() => {
    if (messages.length === 0) return
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true })
    }, 100)
    return () => clearTimeout(timer)
  }, [messages.length, messages.at(-1)?.id])

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Niciun mesaj încă. Scrie prima întrebare mai jos.</Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.list}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
    />
  )
}

const styles = StyleSheet.create({
  list: { padding: 12, paddingBottom: 8, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', padding: 24 },
  emptyText: { textAlign: 'center', color: colors.brownMuted, fontSize: 14, lineHeight: 20 },
  row: { marginBottom: 10 },
  rowClient: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '88%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  bubbleClient: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  bubbleOther: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  sender: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: colors.brownMuted,
  },
  body: { fontSize: 15, lineHeight: 21, color: colors.brown },
  senderOnAccent: { color: 'rgba(255,255,255,0.85)' },
  bodyOnAccent: { color: colors.white },
})
