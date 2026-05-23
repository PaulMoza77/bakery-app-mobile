import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { colors } from '@/theme/colors'

interface InputProps extends TextInputProps {
  label: string
  error?: string | null
}

export function Input({ label, error, style, ...props }: InputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.brownMuted}
        style={[styles.input, error && styles.inputError, style]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.brown,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.brown,
  },
  inputError: { borderColor: colors.danger },
  error: { marginTop: 4, fontSize: 13, color: colors.danger },
})
