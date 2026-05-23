import { useCallback, useMemo, useState } from 'react'
import type { CakeCatalog } from '@/lib/cake-builder/catalog'
import { calculateCakePrice } from '@/lib/cake-builder/pricing'
import { CAKE_BUILDER_STEPS } from '@/lib/cake-builder/steps'
import {
  INITIAL_SELECTIONS,
  type CakeBuilderSelections,
  type CakeBuilderStepId,
} from '@/lib/cake-builder/types'

function isStepValid(stepId: CakeBuilderStepId, s: CakeBuilderSelections): boolean {
  switch (stepId) {
    case 'size':
      return Boolean(s.sizeId)
    case 'flavor':
      return Boolean(s.flavorId)
    case 'filling':
      return Boolean(s.fillingId)
    case 'cream':
      return Boolean(s.creamId)
    case 'design':
      return Boolean(s.designId)
    case 'personalize':
      return true
    case 'candles':
    case 'toppers':
    case 'extras':
      return true
    case 'delivery':
      return Boolean(s.deliveryDate)
    default:
      return false
  }
}

export function useCakeBuilder(catalog: CakeCatalog) {
  const [stepIndex, setStepIndex] = useState(0)
  const [selections, setSelections] =
    useState<CakeBuilderSelections>(INITIAL_SELECTIONS)
  const [summaryExpanded, setSummaryExpanded] = useState(false)

  const step = CAKE_BUILDER_STEPS[stepIndex]
  const price = useMemo(
    () => calculateCakePrice(selections, catalog),
    [selections, catalog],
  )
  const canContinue = isStepValid(step.id, selections)
  const isFirst = stepIndex === 0
  const isLast = stepIndex === CAKE_BUILDER_STEPS.length - 1

  const update = useCallback(
    (patch: Partial<CakeBuilderSelections>) => {
      setSelections((prev) => ({ ...prev, ...patch }))
    },
    [],
  )

  const toggleAddon = useCallback((addonId: string) => {
    setSelections((prev) => {
      const has = prev.addonIds.includes(addonId)
      return {
        ...prev,
        addonIds: has
          ? prev.addonIds.filter((id) => id !== addonId)
          : [...prev.addonIds, addonId],
      }
    })
  }, [])

  const goNext = useCallback(() => {
    if (!canContinue) return
    setStepIndex((i) => Math.min(i + 1, CAKE_BUILDER_STEPS.length - 1))
  }, [canContinue])

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < CAKE_BUILDER_STEPS.length) {
      setStepIndex(index)
    }
  }, [])

  const reset = useCallback(() => {
    setSelections(INITIAL_SELECTIONS)
    setStepIndex(0)
    setSummaryExpanded(false)
  }, [])

  return {
    step,
    stepIndex,
    totalSteps: CAKE_BUILDER_STEPS.length,
    steps: CAKE_BUILDER_STEPS,
    selections,
    price,
    canContinue,
    isFirst,
    isLast,
    summaryExpanded,
    setSummaryExpanded,
    update,
    toggleAddon,
    goNext,
    goBack,
    goToStep,
    reset,
  }
}
