import { ActivityIndicator, StyleSheet, Text } from 'react-native'
import { useRouter } from 'expo-router'
import { AtelierProductCard } from '@/components/atelier/AtelierProductCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useAtelierLibrary } from '@/hooks/use-atelier-library'
import { colors } from '@/theme/colors'

export default function MyDigitalLibraryScreen() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { workshops, recipes, loading, error, configured, refetch } = useAtelierLibrary(user?.id)

  if (authLoading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  if (!user) {
    return (
      <Screen>
        <EmptyState
          title="Autentificare necesară"
          description="Conectează-te pentru a vedea workshop-urile și rețetele cumpărate."
        />
        <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
      </Screen>
    )
  }

  const empty = workshops.length === 0 && recipes.length === 0

  return (
    <Screen>
      {!configured && <SupabaseNotice />}
      <Text style={styles.title}>Biblioteca mea</Text>
      <Text style={styles.sub}>
        Conținut digital cumpărat — acces permanent la video și PDF.
      </Text>

      {loading ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 24 }} />
      ) : error && empty ? (
        <>
          <EmptyState title="Eroare" description={error} />
          <Button title="Încearcă din nou" variant="secondary" onPress={() => void refetch()} />
        </>
      ) : empty ? (
        <EmptyState
          title="Biblioteca este goală"
          description="Cumpără un atelier online sau o rețetă pentru a o vedea aici."
        />
      ) : (
        <>
          {workshops.length > 0 ? (
            <>
              <Text style={styles.section}>Ateliere online</Text>
              {workshops.map(({ product }) => (
                <AtelierProductCard
                  key={product.id}
                  product={product}
                  hasAccess
                  onPress={() => router.push(`/atelier/product/${product.id}`)}
                />
              ))}
            </>
          ) : null}

          {recipes.length > 0 ? (
            <>
              <Text style={styles.section}>Rețete</Text>
              {recipes.map(({ product }) => (
                <AtelierProductCard
                  key={product.id}
                  product={product}
                  hasAccess
                  onPress={() => router.push(`/atelier/product/${product.id}`)}
                />
              ))}
            </>
          ) : null}
        </>
      )}

      <Button
        title="Explorează Ateliere"
        variant="ghost"
        onPress={() => router.push('/(tabs)/workshops')}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: colors.brown, marginBottom: 6 },
  sub: { fontSize: 14, color: colors.brownMuted, lineHeight: 20, marginBottom: 16 },
  section: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brown,
    marginTop: 8,
    marginBottom: 10,
  },
})
