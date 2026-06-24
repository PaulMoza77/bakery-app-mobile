import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

interface CakePreviewProps {
  tiers: 1 | 2 | 3
  compact?: boolean
  spongeColor?: string
  creamColor?: string
  glazeColor?: string
}

const TIER_WIDTHS = [120, 96, 72] as const
const TIER_HEIGHTS = [52, 44, 36] as const

export function CakePreview({
  tiers,
  compact = false,
  spongeColor = '#E8C896',
  creamColor = '#FFF5E8',
  glazeColor = '#FAF7F2',
}: CakePreviewProps) {
  const visibleCount = tiers
  const lockedThird = tiers === 2

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.label}>Previzualizare tort</Text>
      <View style={[styles.stage, compact && styles.stageCompact]}>
        <View style={styles.plate} />

        {[0, 1, 2].map((index) => {
          const tierNumber = index + 1
          const isVisible = tierNumber <= visibleCount
          const isLocked = lockedThird && tierNumber === 3
          const width = TIER_WIDTHS[index]
          const height = TIER_HEIGHTS[index]

          if (!isVisible && !isLocked) return null

          return (
            <View
              key={tierNumber}
              style={[
                styles.tierWrap,
                { width, marginBottom: index < 2 ? 4 : 0 },
                isLocked && styles.tierLockedWrap,
              ]}
            >
              <View
                style={[
                  styles.tier,
                  {
                    width,
                    height,
                    backgroundColor: glazeColor,
                    opacity: isLocked ? 0.35 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.creamBand,
                    { backgroundColor: creamColor, opacity: isLocked ? 0.5 : 0.95 },
                  ]}
                />
                <View
                  style={[
                    styles.spongeCore,
                    { backgroundColor: spongeColor, opacity: isLocked ? 0.45 : 1 },
                  ]}
                />
              </View>
              {isLocked ? (
                <View style={styles.lockOverlay}>
                  <Text style={styles.lockText}>+1 etaj</Text>
                </View>
              ) : null}
            </View>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.warm,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  wrapCompact: { padding: 12 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brownMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'column-reverse',
    minHeight: 180,
    paddingBottom: 8,
  },
  stageCompact: { minHeight: 140 },
  plate: {
    position: 'absolute',
    bottom: 0,
    width: 160,
    height: 12,
    borderRadius: 8,
    backgroundColor: '#D4C4B0',
  },
  tierWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  tierLockedWrap: { marginTop: 4 },
  tier: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(61,46,36,0.12)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  creamBand: {
    height: '28%',
    width: '100%',
  },
  spongeCore: {
    flex: 1,
    width: '100%',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  lockText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brownMuted,
    backgroundColor: colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
})
