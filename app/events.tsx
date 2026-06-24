import { Image } from 'expo-image'
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useEventServices } from '@/hooks/use-event-services'
import { colors } from '@/theme/colors'

export default function EventsScreen() {
  const { services, loading, error, configured, refetch } = useEventServices()
  const withImages = services.filter((s) => s.image_url)

  return (
    <Screen>
      <Card variant="soft" style={styles.hero}>
        <Text style={styles.title}>Evenimente</Text>
        <Text style={styles.sub}>
          Transformăm momentele speciale în experiențe dulci, personalizate.
        </Text>
      </Card>

      {!configured && <SupabaseNotice />}

      {withImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gallery}>
          {withImages.map((s) => (
            <Image
              key={s.id}
              source={{ uri: s.image_url! }}
              style={styles.galleryImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.section}>Tipuri de evenimente</Text>
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : error && services.length === 0 ? (
        <View>
          <EmptyState title="Eroare" description={error} />
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </View>
      ) : services.length === 0 ? (
        <EmptyState
          title="Niciun serviciu"
          description="Serviciile pentru evenimente vor apărea aici."
        />
      ) : (
        services.map((s) => (
          <Card key={s.id} style={styles.item}>
            <Text style={styles.itemTitle}>{s.title}</Text>
            {s.description ? (
              <Text style={styles.itemDesc}>{s.description}</Text>
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginBottom: 16 },
  title: { fontSize: 22, fontWeight: '700', color: colors.brown },
  sub: { marginTop: 8, fontSize: 14, color: colors.brownMuted, lineHeight: 20 },
  gallery: { marginBottom: 16 },
  galleryImage: {
    width: 160,
    height: 110,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: colors.warm,
  },
  section: { fontSize: 17, fontWeight: '700', color: colors.brown, marginBottom: 10 },
  item: { marginBottom: 10 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: colors.brown },
  itemDesc: { marginTop: 6, fontSize: 14, color: colors.brownMuted, lineHeight: 20 },
})
