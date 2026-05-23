import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

interface EmptyStateProps {
  title: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.desc}>{description}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: colors.warm,
  },
  title: { fontSize: 17, fontWeight: '600', color: colors.brown, textAlign: 'center' },
  desc: {
    marginTop: 8,
    fontSize: 14,
    color: colors.brownMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
})
