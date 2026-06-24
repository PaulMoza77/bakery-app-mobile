import * as ImagePicker from 'expo-image-picker'
import { StyleSheet, Text, View } from 'react-native'
import { CakeOptionCard } from '@/components/cake-customizer/CakeOptionCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CakeCustomizerCatalog, CakeCustomizationState } from '@/lib/cake-customizer/types'
import { colors } from '@/theme/colors'

interface CakePersonalizationFormProps {
  catalog: CakeCustomizerCatalog
  state: CakeCustomizationState
  onChange: (patch: Partial<CakeCustomizationState>) => void
}

export function CakePersonalizationForm({
  catalog,
  state,
  onChange,
}: CakePersonalizationFormProps) {
  async function pickInspirationImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    })
    if (result.canceled || !result.assets[0]) return
    onChange({ uploadedInspirationImage: result.assets[0].uri })
  }

  return (
    <View style={styles.wrap}>
      <Input
        label="Text pe tort (opțional)"
        value={state.customText ?? ''}
        onChangeText={(customText) => onChange({ customText })}
        placeholder="La mulți ani, Maria!"
      />

      <Text style={styles.sectionLabel}>Culoare principală (opțional)</Text>
      <View style={styles.optionGrid}>
        {catalog.colors.map((option) => (
          <View key={option.id} style={styles.gridItem}>
            <CakeOptionCard
              option={option}
              selected={state.color === option.id}
              onPress={() =>
                onChange({ color: state.color === option.id ? null : option.id })
              }
              compact
            />
          </View>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Temă decor (opțional)</Text>
      {catalog.themes.map((option) => (
        <CakeOptionCard
          key={option.id}
          option={option}
          selected={state.themeId === option.id}
          onPress={() =>
            onChange({ themeId: state.themeId === option.id ? null : option.id })
          }
        />
      ))}

      <Text style={styles.sectionLabel}>Poză inspirație (opțional)</Text>
      <Button
        title={state.uploadedInspirationImage ? 'Schimbă imaginea' : 'Încarcă o poză'}
        variant="secondary"
        onPress={() => void pickInspirationImage()}
      />
      {state.uploadedInspirationImage ? (
        <Text style={styles.hint}>Imagine selectată — o vom folosi ca referință.</Text>
      ) : (
        <Text style={styles.helper}>
          Poți atașa o poză de pe Pinterest sau de la un tort anterior.
        </Text>
      )}

      <Input
        label="Observații (opțional)"
        value={state.notes ?? ''}
        onChangeText={(notes) => onChange({ notes })}
        placeholder="Alergii, preferințe, detalii pentru livrare..."
        multiline
        style={styles.notesInput}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.brown,
    marginTop: 8,
    marginBottom: 8,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 0,
  },
  gridItem: { width: '48%' },
  hint: { fontSize: 13, color: colors.success, marginTop: 6, marginBottom: 8 },
  helper: { fontSize: 13, color: colors.brownMuted, marginTop: 6, marginBottom: 8, lineHeight: 18 },
  notesInput: { minHeight: 96, textAlignVertical: 'top' },
})
