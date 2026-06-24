import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { AtelierCategoryCard } from '@/components/atelier/AtelierCategoryCard'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import {
  ATELIER_CATEGORY_META,
  type AtelierCategorySlug,
} from '@/lib/atelier/types'
import { isSupabaseConfigured } from '@/lib/supabase/client'
import { colors } from '@/theme/colors'

const CATEGORY_ORDER: AtelierCategorySlug[] = ['evenimente', 'ateliere-online', 'retete']

export function AteliereHomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const configured = isSupabaseConfigured

  return (
    <Screen>
      <Card variant="hero" style={styles.hero}>
        <Text style={styles.heroTitle}>Ateliere</Text>
        <Text style={styles.heroSub}>
          Descoperă evenimente, workshop-uri video și rețete de la patiserii Flavors.
        </Text>
      </Card>

      {!configured && <SupabaseNotice />}

      {CATEGORY_ORDER.map((slug) => {
        const meta = ATELIER_CATEGORY_META[slug]
        return (
          <AtelierCategoryCard
            key={slug}
            title={meta.title}
            subtitle={meta.subtitle}
            imageUrl={meta.imageUrl}
            onPress={() => router.push(`/atelier/${slug}`)}
          />
        )
      })}

      <View style={styles.libraryRow}>
        <Text style={styles.libraryTitle}>Biblioteca mea</Text>
        <Text style={styles.librarySub}>
          Workshop-uri și rețete cumpărate — acces permanent.
        </Text>
        <Button
          title={user ? 'Deschide biblioteca' : 'Autentificare pentru bibliotecă'}
          variant="secondary"
          onPress={() =>
            user ? router.push('/atelier/library') : router.push('/(auth)/login')
          }
        />
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginBottom: 18 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: colors.white },
  heroSub: { marginTop: 8, fontSize: 14, color: '#E8DDD0', lineHeight: 20 },
  libraryRow: {
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  libraryTitle: { fontSize: 17, fontWeight: '700', color: colors.brown },
  librarySub: { fontSize: 13, color: colors.brownMuted, lineHeight: 18, marginBottom: 4 },
})
