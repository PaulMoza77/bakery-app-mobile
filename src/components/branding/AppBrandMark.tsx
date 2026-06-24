import { Image } from 'expo-image'
import { StyleSheet, Text, View, type ViewStyle } from 'react-native'
import { useAppTheme } from '@/contexts/BrandingContext'

interface AppBrandMarkProps {
  compact?: boolean
  style?: ViewStyle
  showName?: boolean
}

export function AppBrandMark({ compact, style, showName = true }: AppBrandMarkProps) {
  const theme = useAppTheme()
  const size = compact ? 28 : 36

  return (
    <View style={[styles.row, style]}>
      {theme.logoUrl ? (
        <Image
          source={{ uri: theme.logoUrl }}
          style={{ width: size, height: size }}
          contentFit="contain"
        />
      ) : theme.faviconUrl ? (
        <Image
          source={{ uri: theme.faviconUrl }}
          style={{ width: size, height: size, borderRadius: 6 }}
          contentFit="contain"
        />
      ) : (
        <View
          style={[
            styles.fallback,
            {
              width: size,
              height: size,
              borderRadius: compact ? 8 : 10,
              backgroundColor: theme.colors.accent,
            },
          ]}
        >
          <Text style={styles.fallbackText}>{theme.appName.charAt(0).toUpperCase()}</Text>
        </View>
      )}
      {showName ? (
        <Text
          style={[
            compact ? styles.nameCompact : styles.name,
            { color: theme.colors.brown, fontFamily: theme.fonts.heading },
          ]}
          numberOfLines={1}
        >
          {theme.appName}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  name: { fontSize: 18, fontWeight: '700', flexShrink: 1 },
  nameCompact: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
})
