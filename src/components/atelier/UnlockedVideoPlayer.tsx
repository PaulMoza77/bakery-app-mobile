import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { Image } from 'expo-image'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

interface UnlockedVideoPlayerProps {
  videoUrl: string
  title: string
  thumbnailUrl?: string | null
}

export function UnlockedVideoPlayer({ videoUrl, title, thumbnailUrl }: UnlockedVideoPlayerProps) {
  async function openVideo() {
    await WebBrowser.openBrowserAsync(videoUrl)
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Video atelier</Text>
      <Pressable style={styles.player} onPress={() => void openVideo()} accessibilityRole="button">
        {thumbnailUrl ? (
          <Image source={{ uri: thumbnailUrl }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={styles.thumbPlaceholder} />
        )}
        <View style={styles.playOverlay}>
          <View style={styles.playBtn}>
            <Ionicons name="play" size={28} color={colors.white} />
          </View>
          <Text style={styles.playText}>Redă video</Text>
        </View>
      </Pressable>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  label: { fontSize: 13, fontWeight: '700', color: colors.brownMuted, marginBottom: 8 },
  player: {
    aspectRatio: 16 / 9,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.warm,
  },
  thumb: { width: '100%', height: '100%' },
  thumbPlaceholder: { flex: 1, backgroundColor: '#3D2E24' },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: { marginTop: 10, color: colors.white, fontWeight: '700', fontSize: 14 },
  title: { marginTop: 8, fontSize: 14, color: colors.brownMuted },
})
