import { Ionicons } from '@expo/vector-icons'
import * as WebBrowser from 'expo-web-browser'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { colors } from '@/theme/colors'

interface RecipePdfAccessProps {
  pdfUrl: string
  title: string
}

export function RecipePdfAccess({ pdfUrl, title }: RecipePdfAccessProps) {
  async function openPdf() {
    await WebBrowser.openBrowserAsync(pdfUrl)
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={22} color={colors.accent} />
        <Text style={styles.label}>Rețetă PDF</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Button title="Vezi / descarcă PDF" onPress={() => void openPdf()} />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 8,
    gap: 10,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 15, fontWeight: '700', color: colors.brown },
  title: { fontSize: 14, color: colors.brownMuted, lineHeight: 20 },
})
