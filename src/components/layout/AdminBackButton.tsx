import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'

interface AdminBackButtonProps {
  /** Where to go when there is no navigation history (e.g. opened Admin directly). */
  fallbackHref?: '/(tabs)/menu'
}

export function AdminBackButton({
  fallbackHref = '/(tabs)/menu',
}: AdminBackButtonProps) {
  const router = useRouter()
  const theme = useAppTheme()

  function handlePress() {
    if (router.canGoBack()) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={10}
      style={styles.btn}
      accessibilityRole="button"
      accessibilityLabel="Înapoi"
    >
      <Ionicons name="chevron-back" size={26} color={theme.colors.brown} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  btn: {
    marginLeft: 4,
    paddingVertical: 4,
    paddingRight: 8,
  },
})
