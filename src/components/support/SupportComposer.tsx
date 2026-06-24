import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppTheme } from '@/contexts/BrandingContext'

interface SupportComposerProps {
  onSend: (text: string) => boolean | void | Promise<boolean | void>
  sending?: boolean
  sendingLabel?: string
  disabled?: boolean
  placeholder?: string
  retryText?: string | null
}

export function SupportComposer({
  onSend,
  sending,
  sendingLabel,
  disabled,
  placeholder = 'Scrie un mesaj…',
  retryText,
}: SupportComposerProps) {
  const { colors: c } = useAppTheme()
  const insets = useSafeAreaInsets()
  const [text, setText] = useState('')

  useEffect(() => {
    if (retryText) setText(retryText)
  }, [retryText])

  async function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || sending || disabled) return
    const result = await onSend(trimmed)
    if (result !== false) {
      setText('')
    }
  }

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {sending && sendingLabel ? (
        <Text style={[styles.hint, { color: c.textMuted }]}>{sendingLabel}</Text>
      ) : null}
      {retryText ? (
        <Text style={[styles.hint, { color: c.danger }]}>
          Trimiterea a eșuat. Apasă Trimite sau mesajul roșu pentru a reîncerca.
        </Text>
      ) : null}
      <View style={styles.row}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: c.border,
              backgroundColor: c.background,
              color: c.text,
            },
          ]}
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor={c.textMuted}
          multiline
          editable={!disabled && !sending}
        />
        <Pressable
          onPress={() => void handleSend()}
          disabled={disabled || sending || !text.trim()}
          style={({ pressed }) => [
            styles.send,
            { backgroundColor: c.accent },
            (disabled || sending || !text.trim()) && styles.sendDisabled,
            pressed && { opacity: 0.85 },
          ]}
        >
          {sending ? (
            <ActivityIndicator color={c.white} size="small" />
          ) : (
            <Text style={[styles.sendLabel, { color: c.white }]}>Trimite</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 12,
  },
  hint: {
    fontSize: 11,
    marginBottom: 6,
    lineHeight: 15,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 15,
  },
  send: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 72,
    alignItems: 'center',
  },
  sendDisabled: { opacity: 0.45 },
  sendLabel: { fontWeight: '700', fontSize: 14 },
})
