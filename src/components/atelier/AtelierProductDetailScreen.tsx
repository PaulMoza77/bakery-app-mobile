import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { LockedContentPreview } from '@/components/atelier/LockedContentPreview'
import { PurchaseAccessButton } from '@/components/atelier/PurchaseAccessButton'
import { RecipePdfAccess } from '@/components/atelier/RecipePdfAccess'
import { UnlockedVideoPlayer } from '@/components/atelier/UnlockedVideoPlayer'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useAuth } from '@/contexts/AuthContext'
import { useAtelierProductDetail } from '@/hooks/use-atelier-product-detail'
import { usePurchaseAtelier } from '@/hooks/use-purchase-atelier'
import { formatEventDateTime } from '@/lib/atelier/format'
import { recipeContentLabel } from '@/lib/atelier/types'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'

interface AtelierProductDetailScreenProps {
  productId: string | undefined
}

function BulletList({ items, title }: { items: string[]; title: string }) {
  if (items.length === 0) return null
  return (
    <Card style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={styles.bullet}>
          • {item}
        </Text>
      ))}
    </Card>
  )
}

export function AtelierProductDetailScreen({ productId }: AtelierProductDetailScreenProps) {
  const router = useRouter()
  const { user } = useAuth()
  const {
    product,
    hasAccess,
    loading,
    error,
    configured,
    notFound,
    refetch,
    setEntitlement,
  } = useAtelierProductDetail(productId)

  const { purchase, purchasing, error: purchaseError, clearError } = usePurchaseAtelier(() => {
    void refetch()
  })

  async function handlePurchase() {
    if (!user) {
      router.push('/(auth)/login')
      return
    }
    if (!product) return
    clearError()
    const entitlement = await purchase(user.id, product)
    if (entitlement) setEntitlement(entitlement)
  }

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  if (notFound || !product) {
    return (
      <Screen>
        <EmptyState title="Produs negăsit" description="Acest conținut nu este disponibil." />
        <Button title="Înapoi" variant="secondary" onPress={() => router.back()} />
      </Screen>
    )
  }

  const p = product
  const videoUrl = p.type === 'workshop' ? p.videoUrl : p.recipeVideoUrl

  return (
    <Screen>
      {!configured && <SupabaseNotice />}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.heroWrap}>
        {p.imageUrl ? (
          <Image source={{ uri: p.imageUrl }} style={styles.hero} contentFit="cover" />
        ) : (
          <View style={[styles.hero, styles.heroPlaceholder]} />
        )}
      </View>

      <Text style={styles.title}>{p.titleRo}</Text>
      <Text style={styles.price}>{formatPrice(p.price)}</Text>

      {p.type === 'event' ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Detalii eveniment</Text>
          <Text style={styles.detail}>{formatEventDateTime(p)}</Text>
          {p.locationName ? <Text style={styles.detail}>{p.locationName}</Text> : null}
          {p.locationAddress ? (
            <Text style={styles.detailMuted}>{p.locationAddress}</Text>
          ) : null}
          {p.hostName ? <Text style={styles.detail}>Gazdă: {p.hostName}</Text> : null}
          {p.seatsAvailable != null ? (
            <Text style={styles.detail}>{p.seatsAvailable} locuri disponibile</Text>
          ) : null}
        </Card>
      ) : null}

      {p.type === 'workshop' ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Atelier online</Text>
          {p.workshopCategory ? <Text style={styles.detail}>{p.workshopCategory}</Text> : null}
          {p.durationMinutes ? (
            <Text style={styles.detail}>Durată: {p.durationMinutes} minute</Text>
          ) : null}
          {p.presenterName ? <Text style={styles.detail}>Prezentator: {p.presenterName}</Text> : null}
          {p.difficulty ? <Text style={styles.detail}>Dificultate: {p.difficulty}</Text> : null}
        </Card>
      ) : null}

      {p.type === 'recipe' ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Rețetă digitală</Text>
          {p.difficulty ? <Text style={styles.detail}>Dificultate: {p.difficulty}</Text> : null}
          {p.preparationTimeMinutes ? (
            <Text style={styles.detail}>Pregătire: {p.preparationTimeMinutes} min</Text>
          ) : null}
          <Text style={styles.detail}>Format: {recipeContentLabel(p)}</Text>
          {p.allergens.length > 0 ? (
            <Text style={styles.detailMuted}>Alergeni: {p.allergens.join(', ')}</Text>
          ) : null}
        </Card>
      ) : null}

      {p.descriptionRo ? <Text style={styles.desc}>{p.descriptionRo}</Text> : null}

      {p.type === 'event' ? (
        <BulletList items={p.includedItems} title="Ce este inclus" />
      ) : null}

      {p.type === 'workshop' ? (
        <>
          <BulletList items={p.whatYouLearn} title="Ce vei învăța" />
          <BulletList items={p.includedMaterials} title="Materiale incluse" />
        </>
      ) : null}

      {p.type === 'recipe' && !hasAccess ? (
        <>
          {p.ingredientsPreview ? (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Previzualizare ingrediente</Text>
              <Text style={styles.detailMuted}>{p.ingredientsPreview}</Text>
            </Card>
          ) : null}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Ce primești</Text>
            <Text style={styles.detailMuted}>
              Rețetă completă, pași detaliați
              {p.pdfUrl ? ', PDF descărcabil' : ''}
              {p.recipeVideoUrl ? ', video demonstrativ' : ''}.
            </Text>
          </Card>
          <LockedContentPreview product={p} />
        </>
      ) : null}

      {p.type === 'workshop' && !hasAccess ? <LockedContentPreview product={p} /> : null}

      {hasAccess && p.type === 'workshop' && videoUrl ? (
        <UnlockedVideoPlayer videoUrl={videoUrl} title={p.titleRo} thumbnailUrl={p.imageUrl} />
      ) : null}

      {hasAccess && p.type === 'recipe' ? (
        <>
          {p.pdfUrl ? <RecipePdfAccess pdfUrl={p.pdfUrl} title={p.titleRo} /> : null}
          {p.recipeVideoUrl ? (
            <UnlockedVideoPlayer
              videoUrl={p.recipeVideoUrl}
              title={`Video: ${p.titleRo}`}
              thumbnailUrl={p.imageUrl}
            />
          ) : null}
          {p.ingredientsPreview ? (
            <Card style={styles.section}>
              <Text style={styles.sectionTitle}>Ingrediente</Text>
              <Text style={styles.detailMuted}>{p.ingredientsPreview}</Text>
            </Card>
          ) : null}
        </>
      ) : null}

      <PurchaseAccessButton
        product={p}
        hasAccess={hasAccess}
        loading={purchasing}
        onPurchase={() => void handlePurchase()}
        error={purchaseError}
      />

      {hasAccess && (p.type === 'workshop' || p.type === 'recipe') ? (
        <Button
          title="Deschide în Biblioteca mea"
          variant="ghost"
          onPress={() => router.push('/atelier/library')}
        />
      ) : null}
    </Screen>
  )
}

const styles = StyleSheet.create({
  heroWrap: {
    aspectRatio: 1.35,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.warm,
    marginBottom: 14,
  },
  hero: { width: '100%', height: '100%' },
  heroPlaceholder: { backgroundColor: colors.warm },
  title: { fontSize: 24, fontWeight: '800', color: colors.brown, lineHeight: 30 },
  price: { fontSize: 20, fontWeight: '800', color: colors.accent, marginTop: 8, marginBottom: 12 },
  desc: { fontSize: 15, color: colors.brownMuted, lineHeight: 22, marginBottom: 8 },
  section: { marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.brown, marginBottom: 8 },
  detail: { fontSize: 14, color: colors.brown, marginTop: 4, lineHeight: 20 },
  detailMuted: { fontSize: 14, color: colors.brownMuted, marginTop: 4, lineHeight: 20 },
  bullet: { fontSize: 14, color: colors.brownMuted, marginTop: 4, lineHeight: 20 },
  error: { color: colors.danger, marginBottom: 8 },
})
