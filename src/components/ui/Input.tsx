import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'

interface InputProps extends TextInputProps {
  label: string
  error?: string | null
}

export function Input({ label, error, style, ...props }: InputProps) {
  const theme = useAppTheme()

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: theme.colors.brown }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.brownMuted}
        style={[
          styles.input,
          {
            borderColor: error ? theme.colors.danger : theme.colors.border,
            backgroundColor: theme.colors.surface,
            color: theme.colors.brown,
            borderRadius: theme.radii.button,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={[styles.error, { color: theme.colors.danger }]}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  error: { marginTop: 4, fontSize: 13 },
})
