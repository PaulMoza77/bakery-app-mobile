import { StyleSheet, Text, View } from 'react-native'
import { AdminBackButton } from '@/components/layout/AdminBackButton'
import { useAppTheme } from '@/contexts/BrandingContext'

interface SupportChatHeaderProps {
  subtitle?: string
}

export function SupportChatHeader({
  subtitle = 'Asistent AI activ · echipa preia când e nevoie',
}: SupportChatHeaderProps) {
  const { colors: c } = useAppTheme()

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.surface,
          borderBottomColor: c.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <AdminBackButton />
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: c.text }]}>Suport</Text>
            <View style={styles.online}>
              <View style={[styles.dot, { backgroundColor: c.accent }]} />
              <Text style={[styles.onlineText, { color: c.textMuted }]}>Online</Text>
            </View>
          </View>
          <Text style={[styles.subtitle, { color: c.textMuted }]} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  headerContent: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  online: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: { fontSize: 12, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 6 },
})
