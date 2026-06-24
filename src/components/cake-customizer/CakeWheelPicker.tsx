import { useCallback, useEffect, useRef, useState } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { colors } from '@/theme/colors'

export interface WheelPickerItem {
  id: string
  label: string
  hint?: string
}

interface CakeWheelPickerProps {
  items: WheelPickerItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

const ITEM_HEIGHT = 56
const VISIBLE_ROWS = 5
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS
const SIDE_PADDING = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2

export function CakeWheelPicker({ items, selectedId, onSelect }: CakeWheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      if (items.length === 0) return
      const clamped = Math.max(0, Math.min(index, items.length - 1))
      scrollRef.current?.scrollTo({ y: clamped * ITEM_HEIGHT, animated })
      setActiveIndex(clamped)
      onSelect(items[clamped].id)
    },
    [items, onSelect],
  )

  useEffect(() => {
    if (items.length === 0) return
    const index = selectedId
      ? Math.max(0, items.findIndex((item) => item.id === selectedId))
      : 0
    const resolved = index >= 0 ? index : 0
    setActiveIndex(resolved)
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: resolved * ITEM_HEIGHT, animated: false })
    })
    if (!selectedId && items[0]) {
      onSelect(items[0].id)
    }
  }, [items, selectedId, onSelect])

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)
    if (index >= 0 && index < items.length && index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  function handleScrollEnd(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT)
    scrollToIndex(index)
  }

  if (items.length === 0) return null

  const selectedItem = items[activeIndex] ?? items[0]

  return (
    <View style={styles.wrap}>
      <View style={styles.wheelFrame}>
        <View style={styles.selectionBand} pointerEvents="none" />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          nestedScrollEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          contentContainerStyle={{ paddingVertical: SIDE_PADDING }}
          style={styles.scroll}
        >
          {items.map((item, index) => {
            const distance = Math.abs(index - activeIndex)
            const opacity = distance === 0 ? 1 : distance === 1 ? 0.45 : 0.2
            const scale = distance === 0 ? 1 : distance === 1 ? 0.92 : 0.85

            return (
              <View key={item.id} style={styles.row}>
                <Text
                  style={[
                    styles.label,
                    index === activeIndex && styles.labelActive,
                    { opacity, transform: [{ scale }] },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      </View>

      {selectedItem.hint ? (
        <Text style={styles.hint}>{selectedItem.hint}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  wheelFrame: {
    width: '100%',
    maxWidth: 320,
    height: WHEEL_HEIGHT,
    position: 'relative',
  },
  scroll: { flex: 1 },
  selectionBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: SIDE_PADDING,
    height: ITEM_HEIGHT,
    borderRadius: 12,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 0,
  },
  row: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    fontSize: 20,
    fontWeight: '500',
    color: colors.brownMuted,
    textAlign: 'center',
  },
  labelActive: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.brown,
  },
  hint: {
    marginTop: 20,
    fontSize: 14,
    color: colors.brownMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 24,
    maxWidth: 320,
  },
})
