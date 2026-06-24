import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { CakePreview } from '@/components/cake-customizer/CakePreview'
import type { CakeCustomizerStep } from '@/lib/cake-customizer/types'
import { colors } from '@/theme/colors'

interface CakeStepLayoutProps {
  step: CakeCustomizerStep
  stepIndex: number
  totalSteps: number
  tiers: 1 | 2 | 3 | null
  children: ReactNode
  footer?: ReactNode
  centered?: boolean
}

export function CakeStepLayout({
  step,
  stepIndex,
  totalSteps,
  tiers,
  children,
  footer,
  centered = false,
}: CakeStepLayoutProps) {
  const showPreview =
    tiers != null && step.id !== 'summary' && step.id !== 'persons'

  return (
    <View style={styles.wrap}>
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>
          Pas {stepIndex + 1} din {totalSteps}
        </Text>
        <Text style={styles.progressPct}>
          {Math.round(((stepIndex + 1) / totalSteps) * 100)}%
        </Text>
      </View>

      <View style={styles.progressBar}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[styles.progressSegment, i <= stepIndex && styles.progressSegmentActive]}
          />
        ))}
      </View>

      <Text style={[styles.title, centered && styles.titleCentered]}>{step.title}</Text>
      <Text style={[styles.subtitle, centered && styles.subtitleCentered]}>
        {step.subtitle}
      </Text>

      {showPreview ? (
        <View style={styles.previewWrap}>
          <CakePreview tiers={tiers} compact />
        </View>
      ) : null}

      <View style={[styles.body, centered && styles.bodyCentered]}>{children}</View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: { fontSize: 12, fontWeight: '700', color: colors.accent },
  progressPct: { fontSize: 12, fontWeight: '600', color: colors.brownMuted },
  progressBar: { flexDirection: 'row', gap: 4, marginBottom: 16 },
  progressSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  progressSegmentActive: { backgroundColor: colors.accent },
  title: { fontSize: 22, fontWeight: '800', color: colors.brown, lineHeight: 28 },
  titleCentered: { textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    color: colors.brownMuted,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 20,
  },
  subtitleCentered: { textAlign: 'center', marginBottom: 8 },
  previewWrap: { marginBottom: 16 },
  body: { flex: 1 },
  bodyCentered: { justifyContent: 'center' },
  footer: { marginTop: 8, gap: 10 },
})
