import { ReactNode } from 'react'
import { StyleSheet, View, type ViewStyle } from 'react-native'
import { colors } from '@/theme/colors'

interface CardProps {
  children: ReactNode
  style?: ViewStyle
  variant?: 'default' | 'hero' | 'soft'
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  const variantStyle =
    variant === 'hero' ? styles.hero : variant === 'soft' ? styles.soft : null
  return <View style={[styles.base, variantStyle, style]}>{children}</View>
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hero: {
    backgroundColor: colors.brown,
    borderColor: colors.brown,
  },
  soft: {
    backgroundColor: colors.warm,
    borderColor: colors.warm,
  },
})
