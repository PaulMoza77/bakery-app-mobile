import { Image } from 'expo-image'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useWorkshops } from '@/hooks/use-workshops'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

export default function WorkshopsTab() {
  const { workshops, loading, error, configured, refetch } = useWorkshops()

  return (
    <Screen>
      <Card variant="hero" style={styles.hero}>
        <Text style={styles.heroTitle}>Ateliere online</Text>
        <Text style={styles.heroSub}>Învață de la patiserii noștri. Acces după plată.</Text>
      </Card>

      {!configured && <SupabaseNotice />}

      <Text style={styles.section}>Ateliere disponibile</Text>
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : error && workshops.length === 0 ? (
        <View>
          <EmptyState title="Eroare" description={error} />
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </View>
      ) : workshops.length === 0 ? (
        <EmptyState
          title="Niciun atelier"
          description="Atelierele active vor apărea aici."
        />
      ) : (
        workshops.map((w) => (
          <Card key={w.id} style={styles.item}>
            {w.image_url ? (
              <Image source={{ uri: w.image_url }} style={styles.image} contentFit="cover" />
            ) : null}
            <Text style={styles.name}>{w.title}</Text>
            {w.description ? <Text style={styles.desc}>{w.description}</Text> : null}
            <Text style={styles.price}>{formatPrice(w.price)}</Text>
          </Card>
        ))
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  heroSub: { marginTop: 8, fontSize: 14, color: '#E8DDD0', lineHeight: 20 },
  section: { fontSize: 17, fontWeight: '700', color: colors.brown, marginBottom: 10 },
  item: { marginBottom: 12, padding: 0, overflow: 'hidden' },
  image: { width: '100%', height: 160, backgroundColor: colors.warm },
  name: { fontSize: 17, fontWeight: '700', color: colors.brown, padding: 12, paddingBottom: 0 },
  desc: {
    fontSize: 14,
    color: colors.brownMuted,
    paddingHorizontal: 12,
    marginTop: 6,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    padding: 12,
    paddingTop: 8,
  },
})
