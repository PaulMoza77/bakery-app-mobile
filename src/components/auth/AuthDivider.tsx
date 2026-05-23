import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

export function AuthDivider() {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>sau</Text>
      <View style={styles.line} />
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  text: { fontSize: 13, color: colors.brownMuted, fontWeight: '500' },
})
