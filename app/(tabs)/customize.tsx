import * as ImagePicker from 'expo-image-picker'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useCakeBuilder } from '@/hooks/use-cake-builder'
import { useCakeCatalog } from '@/hooks/use-cake-catalog'
import { ensurePrintedImageAddon } from '@/lib/cake-builder/addon-helpers'
import { buildCustomCakeOrderInput } from '@/lib/cake-builder/submit'
import { CAKE_BUILDER_STEPS } from '@/lib/cake-builder/steps'
import type { CakeBuilderStepId } from '@/lib/cake-builder/types'
import { uploadCakePrintImage, type CakePrintImage } from '@/lib/cake-builder/upload-print'
import { createCustomCakeOrder } from '@/lib/database/queries/cake-catalog'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

function optionFieldForStep(stepId: CakeBuilderStepId): keyof import('@/lib/cake-builder/types').CakeBuilderSelections | null {
  switch (stepId) {
    case 'size':
      return 'sizeId'
    case 'flavor':
      return 'flavorId'
    case 'filling':
      return 'fillingId'
    case 'cream':
      return 'creamId'
    case 'design':
      return 'designId'
    default:
      return null
  }
}

export default function CustomizeTab() {
  const router = useRouter()
  const { user } = useAuth()
  const { catalog, loading, error, configured, ready, refetch } = useCakeCatalog()
  const builder = useCakeBuilder(catalog)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [printImage, setPrintImage] = useState<CakePrintImage | null>(null)

  const step = builder.step
  const field = optionFieldForStep(step.id)

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]) return
    const asset = result.assets[0]
    setPrintImage({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
    })
    builder.update({
      addonIds: ensurePrintedImageAddon(
        builder.selections.addonIds,
        catalog,
        true,
      ),
    })
  }

  async function handleSubmit() {
    if (!builder.canContinue) return
    if (!user) {
      router.push('/(auth)/login')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      let printedUrl: string | null = null
      if (printImage) {
        printedUrl = await uploadCakePrintImage(printImage, user.id)
      }
      const input = buildCustomCakeOrderInput(
        user.id,
        builder.selections,
        catalog,
        builder.price.totalCents,
        printedUrl,
      )
      const result = await createCustomCakeOrder(input)
      if (result.error || !result.data) {
        setSubmitError(result.error ?? 'Comanda nu a putut fi trimisă')
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
      <Screen>
        <Card>
          <Text style={styles.successTitle}>Tort comandat!</Text>
          <Text style={styles.successSub}>
            Comanda ta personalizată a fost înregistrată. Vei primi confirmare de la patiserie.
          </Text>
          <View style={{ marginTop: 16, gap: 10 }}>
            <Button title="Vezi comenzile" onPress={() => router.push('/orders')} />
            <Button title="Înapoi" variant="secondary" onPress={() => setSubmitted(false)} />
          </View>
        </Card>
      </Screen>
    )
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  if (!configured) {
    return (
      <Screen>
        <SupabaseNotice />
      </Screen>
    )
  }

  if (!ready) {
    return (
      <Screen>
        <EmptyState
          title="Catalog indisponibil"
          description={error ?? 'Opțiunile pentru tort nu sunt configurate încă.'}
        />
        {error ? (
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        ) : null}
      </Screen>
    )
  }

  const options =
    step.id === 'size'
      ? catalog.sizes
      : step.id === 'flavor'
        ? catalog.flavors
        : step.id === 'filling'
          ? catalog.fillings
          : step.id === 'cream'
            ? catalog.creams
            : step.id === 'design'
              ? catalog.designs
              : step.id === 'candles'
                ? catalog.candles
                : step.id === 'toppers'
                  ? catalog.toppers
                  : step.id === 'extras'
                    ? catalog.extras
                    : []

  return (
    <Screen>
      <Card variant="soft">
        <Text style={styles.overline}>
          Pas {builder.stepIndex + 1} / {CAKE_BUILDER_STEPS.length}
        </Text>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSub}>{step.subtitle}</Text>
      </Card>

      <View style={styles.progress}>
        {CAKE_BUILDER_STEPS.map((s, i) => (
          <View
            key={s.id}
            style={[styles.dot, i <= builder.stepIndex && styles.dotActive]}
          />
        ))}
      </View>

      {field && (
        <View style={styles.options}>
          {options.map((opt) => {
            const selected = builder.selections[field] === opt.id
            return (
              <Pressable
                key={opt.id}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => builder.update({ [field]: opt.id })}
              >
                <Text style={styles.optionName}>{opt.name}</Text>
                {'priceModifierCents' in opt && opt.priceModifierCents > 0 && (
                  <Text style={styles.optionPrice}>
                    +{formatPrice(opt.priceModifierCents)}
                  </Text>
                )}
                {'priceCents' in opt && opt.priceCents > 0 && (
                  <Text style={styles.optionPrice}>+{formatPrice(opt.priceCents)}</Text>
                )}
              </Pressable>
            )
          })}
        </View>
      )}

      {step.id === 'personalize' && (
        <View>
          <Text style={styles.label}>Text pe tort</Text>
          <TextInput
            style={styles.input}
            value={builder.selections.cakeText}
            onChangeText={(cakeText) => builder.update({ cakeText })}
            placeholder="La mulți ani!"
            placeholderTextColor={colors.brownMuted}
          />
          <Button title="Alege imagine (opțional)" variant="secondary" onPress={() => void pickImage()} />
          {printImage ? (
            <Text style={styles.hint}>Imagine selectată pentru print</Text>
          ) : null}
        </View>
      )}

      {(step.id === 'candles' || step.id === 'toppers' || step.id === 'extras') && (
        <View style={styles.options}>
          {options.map((opt) => {
            const selected = builder.selections.addonIds.includes(opt.id)
            return (
              <Pressable
                key={opt.id}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => builder.toggleAddon(opt.id)}
              >
                <Text style={styles.optionName}>{opt.name}</Text>
              </Pressable>
            )
          })}
        </View>
      )}

      {step.id === 'delivery' && (
        <View>
          <Text style={styles.label}>Data ridicării (YYYY-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={builder.selections.deliveryDate}
            onChangeText={(deliveryDate) => builder.update({ deliveryDate })}
            placeholder="2026-06-01"
            placeholderTextColor={colors.brownMuted}
          />
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.notes]}
            value={builder.selections.notes}
            onChangeText={(notes) => builder.update({ notes })}
            multiline
            placeholderTextColor={colors.brownMuted}
          />
        </View>
      )}

      <Card style={styles.summary}>
        <Text style={styles.totalLabel}>Total estimat</Text>
        <Text style={styles.total}>{formatPrice(builder.price.totalCents)}</Text>
      </Card>

      {submitError ? <Text style={styles.error}>{submitError}</Text> : null}

      <View style={styles.actions}>
        {!builder.isFirst && (
          <Button title="Înapoi" variant="secondary" onPress={builder.goBack} />
        )}
        {!builder.isLast ? (
          <Button
            title="Continuă"
            onPress={builder.goNext}
            disabled={!builder.canContinue}
          />
        ) : (
          <Button
            title="Trimite comanda"
            onPress={() => void handleSubmit()}
            loading={submitting}
            disabled={!builder.canContinue}
          />
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  loading: { textAlign: 'center', marginTop: 40, color: colors.brownMuted },
  overline: { fontSize: 12, fontWeight: '700', color: colors.accent },
  stepTitle: { fontSize: 20, fontWeight: '700', color: colors.brown, marginTop: 4 },
  stepSub: { fontSize: 14, color: colors.brownMuted, marginTop: 6 },
  progress: { flexDirection: 'row', gap: 4, marginVertical: 14 },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.accent },
  options: { gap: 8, marginBottom: 12 },
  option: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  optionSelected: { borderColor: colors.accent, backgroundColor: '#FFF5F2' },
  optionName: { fontSize: 16, fontWeight: '600', color: colors.brown },
  optionPrice: { fontSize: 13, color: colors.accent, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: colors.brown, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.white,
    marginBottom: 12,
    fontSize: 16,
    color: colors.brown,
  },
  notes: { minHeight: 80, textAlignVertical: 'top' },
  hint: { fontSize: 13, color: colors.success, marginBottom: 12 },
  summary: { marginVertical: 12 },
  totalLabel: { fontSize: 13, color: colors.brownMuted },
  total: { fontSize: 22, fontWeight: '800', color: colors.brown, marginTop: 4 },
  error: { color: colors.danger, marginBottom: 8 },
  actions: { gap: 10, marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '700', color: colors.brown },
  successSub: { marginTop: 8, fontSize: 14, color: colors.brownMuted, lineHeight: 20 },
})
