import { useCallback, useEffect, useMemo, useState } from 'react'
import { calculateCakeCustomizationPrice } from '@/lib/cake-customizer/pricing'
import { getCakeCustomizerOptions } from '@/lib/cake-customizer/service'
import { CAKE_CUSTOMIZER_STEPS } from '@/lib/cake-customizer/steps'
import type {
  CakeCustomizerCatalog,
  CakeCustomizerStepId,
  CakeCustomizationState,
} from '@/lib/cake-customizer/types'
import { INITIAL_CAKE_CUSTOMIZATION_STATE } from '@/lib/cake-customizer/types'

function isStepComplete(stepId: CakeCustomizerStepId, state: CakeCustomizationState): boolean {
  switch (stepId) {
    case 'persons':
      return Boolean(state.personsOptionId)
    case 'tiers':
      return state.tiers != null
    case 'sponge':
      return Boolean(state.spongeId)
    case 'cream':
      return Boolean(state.creamId)
    case 'glaze':
      return Boolean(state.glazeId)
    case 'personalization':
    case 'summary':
      return true
    default:
      return false
  }
}

export function useCakeCustomizer() {
  const [catalog, setCatalog] = useState<CakeCustomizerCatalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [state, setState] = useState<CakeCustomizationState>(INITIAL_CAKE_CUSTOMIZATION_STATE)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCakeCustomizerOptions()
      setCatalog(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu am putut încărca opțiunile')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const step = CAKE_CUSTOMIZER_STEPS[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === CAKE_CUSTOMIZER_STEPS.length - 1

  const price = useMemo(() => {
    if (!catalog) return { lines: [], totalCents: 0 }
    return calculateCakeCustomizationPrice(state, catalog)
  }, [catalog, state])

  const stateWithPrice = useMemo(
    () => ({ ...state, estimatedPrice: price.totalCents }),
    [state, price.totalCents],
  )

  const canContinue = isStepComplete(step.id, stateWithPrice)

  const update = useCallback((patch: Partial<CakeCustomizationState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }, [])

  const selectPersons = useCallback(
    (optionId: string) => {
      const option = catalog?.persons.find((p) => p.id === optionId)
      update({
        personsOptionId: optionId,
        personsCount: option?.personsCount ?? null,
      })
    },
    [catalog?.persons, update],
  )

  const selectTier = useCallback(
    (optionId: string) => {
      const option = catalog?.tiers.find((t) => t.id === optionId)
      update({ tiers: option?.tierCount ?? null })
    },
    [catalog?.tiers, update],
  )

  const goNext = useCallback(() => {
    if (!canContinue) return
    setStepIndex((i) => Math.min(i + 1, CAKE_CUSTOMIZER_STEPS.length - 1))
  }, [canContinue])

  const goBack = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setStepIndex(0)
    setState(INITIAL_CAKE_CUSTOMIZATION_STATE)
  }, [])

  return {
    catalog,
    loading,
    error,
    refetch: load,
    steps: CAKE_CUSTOMIZER_STEPS,
    step,
    stepIndex,
    isFirst,
    isLast,
    state: stateWithPrice,
    price,
    canContinue,
    update,
    selectPersons,
    selectTier,
    goNext,
    goBack,
    reset,
  }
}

export type UseCakeCustomizerReturn = ReturnType<typeof useCakeCustomizer>
