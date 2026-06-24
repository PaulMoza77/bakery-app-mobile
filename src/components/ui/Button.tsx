import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  disabled?: boolean
  loading?: boolean
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  loading,
}: ButtonProps) {
  const theme = useAppTheme()
  const isDisabled = disabled || loading

  const variantStyle =
    variant === 'primary'
      ? { backgroundColor: theme.colors.accent }
      : variant === 'secondary'
        ? {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }
        : variant === 'danger'
          ? { backgroundColor: theme.colors.danger }
          : { backgroundColor: 'transparent' }

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.white
      : variant === 'ghost'
        ? theme.colors.accent
        : theme.colors.brown

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: theme.radii.button },
        variantStyle,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor, fontFamily: theme.fonts.body }]}>
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: { fontSize: 16, fontWeight: '600' },
})
