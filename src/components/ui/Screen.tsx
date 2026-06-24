import { ReactNode } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppTheme } from '@/contexts/BrandingContext'

interface ScreenProps {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  style?: ViewStyle
  /**
   * Use below a native tab/stack header (default). Matches Produse spacing:
   * no extra SafeArea top inset or scroll content inset under the header.
   */
  compactTop?: boolean
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  compactTop = true,
}: ScreenProps) {
  const theme = useAppTheme()

  const content = (
    <View
      style={[
        padded && styles.padded,
        compactTop && styles.compactTop,
        style,
      ]}
    >
      {children}
    </View>
  )

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.colors.background }]}
      edges={compactTop ? [] : ['top']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            contentInsetAdjustmentBehavior={compactTop ? 'never' : 'automatic'}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  padded: { paddingHorizontal: 16, paddingTop: 8 },
  compactTop: { paddingTop: 0 },
})
