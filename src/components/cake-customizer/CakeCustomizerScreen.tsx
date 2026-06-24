import { useRouter } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { CakePersonalizationForm } from '@/components/cake-customizer/CakePersonalizationForm'
import { CakeStepLayout } from '@/components/cake-customizer/CakeStepLayout'
import { CakeSummary } from '@/components/cake-customizer/CakeSummary'
import { CakeWheelPicker, type WheelPickerItem } from '@/components/cake-customizer/CakeWheelPicker'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/contexts/AuthContext'
import { useCakeCustomizer } from '@/hooks/use-cake-customizer'
import {
  buildCustomizationRequestPayload,
  submitCakeCustomizationRequest,
} from '@/lib/cake-customizer/service'
import type { CakeCustomizerOption, CakeCustomizerStepId } from '@/lib/cake-customizer/types'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

const WHEEL_STEPS: CakeCustomizerStepId[] = ['persons', 'tiers', 'sponge', 'cream', 'glaze']

function optionHint(option: CakeCustomizerOption, showBasePrice = false): string | undefined {
  if (showBasePrice && option.basePrice != null) {
    return `De la ${formatPrice(option.basePrice)}`
  }
  if (option.extraPrice != null && option.extraPrice > 0) {
    return `+${formatPrice(option.extraPrice)}`
  }
  return option.descriptionRo || undefined
}

function toWheelItems(
  options: CakeCustomizerOption[],
  showBasePrice = false,
): WheelPickerItem[] {
  return options.map((option) => ({
    id: option.id,
    label: option.nameRo,
    hint: optionHint(option, showBasePrice),
  }))
}

export function CakeCustomizerScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const customizer = useCakeCustomizer()
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const { catalog, step, stepIndex, steps, state, price } = customizer
  const isWheelStep = WHEEL_STEPS.includes(step.id)

  const handlePersonsSelect = useCallback(
    (id: string) => customizer.selectPersons(id),
    [customizer.selectPersons],
  )

  const handleTierSelect = useCallback(
    (id: string) => customizer.selectTier(id),
    [customizer.selectTier],
  )

  const handleSpongeSelect = useCallback(
    (id: string) => customizer.update({ spongeId: id }),
    [customizer.update],
  )

  const handleCreamSelect = useCallback(
    (id: string) => customizer.update({ creamId: id }),
    [customizer.update],
  )

  const handleGlazeSelect = useCallback(
    (id: string) => customizer.update({ glazeId: id }),
    [customizer.update],
  )

  const wheelConfigs = useMemo(() => {
    if (!catalog) return null
    return {
      persons: {
        items: toWheelItems(catalog.persons, true),
        selectedId: state.personsOptionId,
        onSelect: handlePersonsSelect,
      },
      tiers: {
        items: toWheelItems(catalog.tiers),
        selectedId: catalog.tiers.find((t) => t.tierCount === state.tiers)?.id ?? null,
        onSelect: handleTierSelect,
      },
      sponge: {
        items: toWheelItems(catalog.sponges),
        selectedId: state.spongeId,
        onSelect: handleSpongeSelect,
      },
      cream: {
        items: toWheelItems(catalog.creams),
        selectedId: state.creamId,
        onSelect: handleCreamSelect,
      },
      glaze: {
        items: toWheelItems(catalog.glazes),
        selectedId: state.glazeId,
        onSelect: handleGlazeSelect,
      },
    }
  }, [
    catalog,
    state.personsOptionId,
    state.tiers,
    state.spongeId,
    state.creamId,
    state.glazeId,
    handlePersonsSelect,
    handleTierSelect,
    handleSpongeSelect,
    handleCreamSelect,
    handleGlazeSelect,
  ])

  async function handleSubmit() {
    if (!catalog) return
    if (!user) {
      router.push('/(auth)/login')
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const payload = buildCustomizationRequestPayload(state, price)
      const result = await submitCakeCustomizationRequest(payload)
      if (!result.ok) {
        setSubmitError(result.error)
        return
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Eroare la trimitere')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Screen compactTop>
        <Card style={styles.successCard}>
          <Text style={styles.successTitle}>Cerere trimisă!</Text>
          <Text style={styles.successSub}>
            Am înregistrat configurația tortului tău. Patiseria te va contacta cu
            confirmarea și detaliile finale.
          </Text>
          <View style={styles.successActions}>
            <Button title="Vezi comenzile" onPress={() => router.push('/orders')} />
            <Button
              title="Configurează alt tort"
              variant="secondary"
              onPress={() => {
                setSubmitted(false)
                customizer.reset()
              }}
            />
          </View>
        </Card>
      </Screen>
    )
  }

  if (customizer.loading) {
    return (
      <Screen compactTop>
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      </Screen>
    )
  }

  if (customizer.error || !catalog || !wheelConfigs) {
    return (
      <Screen compactTop>
        <EmptyState
          title="Opțiuni indisponibile"
          description={customizer.error ?? 'Nu am putut încărca configuratorul.'}
        />
        <Button
          title="Încearcă din nou"
          variant="secondary"
          onPress={() => void customizer.refetch()}
        />
      </Screen>
    )
  }

  const activeCatalog = catalog
  const activeWheelConfigs = wheelConfigs

  function renderStepContent() {
    switch (step.id) {
      case 'persons':
      case 'tiers':
      case 'sponge':
      case 'cream':
      case 'glaze': {
        const config = activeWheelConfigs[step.id]
        return (
          <CakeWheelPicker
            items={config.items}
            selectedId={config.selectedId}
            onSelect={config.onSelect}
          />
        )
      }
      case 'personalization':
        return (
          <CakePersonalizationForm
            catalog={activeCatalog}
            state={state}
            onChange={customizer.update}
          />
        )
      case 'summary':
        return <CakeSummary state={state} catalog={activeCatalog} price={price} />
      default:
        return null
    }
  }

  const footer = (
    <>
      {step.id !== 'summary' && price.totalCents > 0 && !isWheelStep ? (
        <Card style={styles.priceCard}>
          <Text style={styles.priceLabel}>Preț estimativ până acum</Text>
          <Text style={styles.priceValue}>{formatPrice(price.totalCents)}</Text>
        </Card>
      ) : null}

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <View style={styles.actions}>
        {!customizer.isFirst ? (
          <Button title="Înapoi" variant="secondary" onPress={customizer.goBack} />
        ) : null}
        {!customizer.isLast ? (
          <Button title="Continuă" onPress={customizer.goNext} disabled={!customizer.canContinue} />
        ) : (
          <Button
            title="Trimite cererea"
            onPress={() => void handleSubmit()}
            loading={submitting}
          />
        )}
      </View>
    </>
  )

  return (
    <Screen compactTop scroll={!isWheelStep} style={isWheelStep ? styles.wheelScreen : undefined}>
      <CakeStepLayout
        step={step}
        stepIndex={stepIndex}
        totalSteps={steps.length}
        tiers={state.tiers}
        centered={isWheelStep}
        footer={footer}
      >
        {renderStepContent()}
      </CakeStepLayout>
    </Screen>
  )
}

const styles = StyleSheet.create({
  wheelScreen: { flex: 1 },
  loader: { marginTop: 48 },
  priceCard: { marginBottom: 4 },
  priceLabel: { fontSize: 13, color: colors.brownMuted },
  priceValue: { fontSize: 20, fontWeight: '800', color: colors.brown, marginTop: 4 },
  actions: { gap: 10, marginBottom: 8 },
  error: { color: colors.danger, marginBottom: 8, fontSize: 14 },
  successCard: { marginTop: 8 },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.brown },
  successSub: {
    marginTop: 10,
    fontSize: 14,
    color: colors.brownMuted,
    lineHeight: 21,
  },
  successActions: { marginTop: 20, gap: 10 },
})
