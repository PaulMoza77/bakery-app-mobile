import { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
  variant?: 'default' | 'hero' | 'soft'
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const theme = useAppTheme()

  const variantStyle =
    variant === 'hero'
      ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
      : variant === 'soft'
        ? { backgroundColor: theme.colors.warm, borderColor: theme.colors.warm }
        : {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          }

  return (
    <View
      style={[
        styles.base,
        { borderRadius: theme.radii.card },
        variantStyle,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    borderWidth: 1,
  },
})
