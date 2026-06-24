import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

interface AtelierCategoryCardProps {
  title: string
  subtitle: string
  imageUrl: string
  onPress: () => void
}

export function AtelierCategoryCard({
  title,
  subtitle,
  imageUrl,
  onPress,
}: AtelierCategoryCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Image source={{ uri: imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 148,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: colors.warm,
  },
  pressed: { opacity: 0.92 },
  image: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.88)',
    fontWeight: '500',
  },
})
