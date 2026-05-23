import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors } from '@/theme/colors'

interface SupportComposerProps {
  onSend: (text: string) => boolean | void | Promise<boolean | void>
  sending?: boolean
  disabled?: boolean
  placeholder?: string
}

export function SupportComposer({
  onSend,
  sending,
  disabled,
  placeholder = 'Scrie un mesaj…',
}: SupportComposerProps) {
  const [text, setText] = useState('')

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    const result = await onSend(trimmed)
    if (result !== false) {
      setText('')
    }
  }

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder}
        placeholderTextColor={colors.brownMuted}
        multiline
        editable={!disabled && !sending}
      />
      <Pressable
        onPress={() => void handleSend()}
        disabled={disabled || sending || !text.trim()}
        style={({ pressed }) => [
          styles.send,
          (disabled || sending || !text.trim()) && styles.sendDisabled,
          pressed && { opacity: 0.85 },
        ]}
      >
        {sending ? (
          <ActivityIndicator color={colors.white} size="small" />
        ) : (
          <Text style={styles.sendLabel}>Trimite</Text>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.brown,
    backgroundColor: colors.cream,
  },
  send: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.accent,
    minWidth: 72,
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.45 },
  sendLabel: { color: colors.white, fontWeight: '700', fontSize: 14 },
})
