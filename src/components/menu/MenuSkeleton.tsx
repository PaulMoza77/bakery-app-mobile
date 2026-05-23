import { StyleSheet, View } from 'react-native'
import { colors } from '@/theme/colors'

function Bone({ style }: { style?: object }) {
  return <View style={[styles.bone, style]} />
}

export function MenuSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.profileCard}>
        <Bone style={styles.avatar} />
        <View style={styles.profileLines}>
          <Bone style={styles.lineLg} />
          <Bone style={styles.lineSm} />
        </View>
      </View>
      {[0, 1, 2].map((i) => (
        <Bone key={i} style={styles.row} />
      ))}
      <Bone style={styles.adminRow} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  profileLines: { flex: 1, gap: 8 },
  lineLg: { height: 18, width: '55%', borderRadius: 6 },
  lineSm: { height: 14, width: '70%', borderRadius: 6 },
  bone: { backgroundColor: colors.warm },
  row: { height: 64, borderRadius: 14 },
  adminRow: { height: 72, borderRadius: 16, marginTop: 4 },
})
