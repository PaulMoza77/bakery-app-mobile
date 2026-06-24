import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import type { ReactNode } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Screen } from '@/components/ui/Screen'
import { SupabaseNotice } from '@/components/ui/SupabaseNotice'
import { useProductsCatalog } from '@/hooks/use-products-catalog'
import { useWorkshops } from '@/hooks/use-workshops'
import {
  formatCountdownDisplay,
  formatDropTimeRange,
  getCountdownParts,
} from '@/lib/drops'
import type { EnrichedDrop } from '@/lib/drops/types'
import { formatPrice } from '@/lib/format/currency'
import { colors } from '@/theme/colors'
import type { WorkshopRow } from '@/types/database'

function OfferSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function DropOfferCard({
  drop,
  badge,
  onPress,
}: {
  drop: EnrichedDrop
  badge: string
  onPress: () => void
}) {
  const countdown = getCountdownParts(drop.countdownTarget)
  const countdownLabel =
    countdown && !countdown.expired ? formatCountdownDisplay(countdown) : null

  return (
    <Pressable
      style={({ pressed }) => [styles.offerCard, pressed && styles.offerCardPressed]}
      onPress={onPress}
    >
      {drop.product.image_url ? (
        <Image source={{ uri: drop.product.image_url }} style={styles.offerImage} contentFit="cover" />
      ) : (
        <View style={[styles.offerImage, styles.offerImagePlaceholder]}>
          <Text style={styles.offerEmoji}>🥐</Text>
        </View>
      )}
      <View style={styles.offerBody}>
        <Text style={styles.offerBadge}>{badge}</Text>
        <Text style={styles.offerName} numberOfLines={2}>
          {drop.product.name}
        </Text>
        <Text style={styles.offerPrice}>{formatPrice(drop.product.price)}</Text>
        {countdownLabel ? (
          <Text style={styles.offerMeta}>⏱ {countdownLabel}</Text>
        ) : (
          <Text style={styles.offerMeta}>
            {formatDropTimeRange(drop.start_time, drop.end_time)}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.brownMuted} />
    </Pressable>
  )
}

function WorkshopOfferCard({
  workshop,
  onPress,
}: {
  workshop: WorkshopRow
  onPress: () => void
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.offerCard, pressed && styles.offerCardPressed]}
      onPress={onPress}
    >
      {workshop.image_url ? (
        <Image
          source={{ uri: workshop.image_url }}
          style={styles.offerImage}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.offerImage, styles.offerImagePlaceholder]}>
          <Text style={styles.offerEmoji}>🎓</Text>
        </View>
      )}
      <View style={styles.offerBody}>
        <Text style={styles.offerBadge}>Last minute</Text>
        <Text style={styles.offerName} numberOfLines={2}>
          {workshop.title}
        </Text>
        <Text style={styles.offerPrice}>{formatPrice(workshop.price)}</Text>
        {workshop.description ? (
          <Text style={styles.offerMeta} numberOfLines={2}>
            {workshop.description}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.brownMuted} />
    </Pressable>
  )
}

export default function OffersTab() {
  const router = useRouter()
  const {
    primaryDrop,
    liveDrops,
    upcomingDrops,
    loading: productsLoading,
    error: productsError,
    configured: productsConfigured,
    refetch: refetchProducts,
  } = useProductsCatalog()
  const {
    workshops,
    loading: workshopsLoading,
    error: workshopsError,
    configured: workshopsConfigured,
    refetch: refetchWorkshops,
  } = useWorkshops()

  const configured = productsConfigured && workshopsConfigured
  const loading = productsLoading || workshopsLoading

  const dailyOffer =
    primaryDrop && (primaryDrop.phase === 'live' || primaryDrop.phase === 'upcoming')
      ? primaryDrop
      : liveDrops[0] ?? upcomingDrops[0] ?? null

  const productOffers = [...liveDrops, ...upcomingDrops].filter(
    (drop) => drop.id !== dailyOffer?.id,
  )

  const lastMinuteWorkshops = [...workshops]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 4)

  function openProduct(drop: EnrichedDrop) {
    router.push(`/product/${drop.product.id}`)
  }

  return (
    <Screen>
      <Card variant="hero" style={styles.hero}>
        <Text style={styles.heroTitle}>Oferte</Text>
        <Text style={styles.heroSub}>
          Promoții zilnice, drop-uri cu stoc limitat și locuri last minute la ateliere.
        </Text>
      </Card>

      {!configured && <SupabaseNotice />}

      {loading ? (
        <ActivityIndicator color={colors.accent} style={styles.loader} />
      ) : (
        <>
          <OfferSection title="Oferta zilei">
            {dailyOffer ? (
              <DropOfferCard
                drop={dailyOffer}
                badge={dailyOffer.phase === 'live' ? 'Live acum' : 'În curând'}
                onPress={() => openProduct(dailyOffer)}
              />
            ) : (
              <EmptyState
                title="Nicio ofertă activă azi"
                description="Revino curând pentru drop-uri și promoții."
              />
            )}
          </OfferSection>

          <OfferSection title="Oferte produse">
            {productsError && productOffers.length === 0 && !dailyOffer ? (
              <View>
                <EmptyState title="Eroare" description={productsError} />
                <Button
                  title="Încearcă din nou"
                  variant="secondary"
                  onPress={() => void refetchProducts()}
                />
              </View>
            ) : productOffers.length === 0 ? (
              <EmptyState
                title="Nicio ofertă la produse"
                description="Drop-urile active vor apărea aici."
              />
            ) : (
              productOffers.map((drop) => (
                <DropOfferCard
                  key={drop.id}
                  drop={drop}
                  badge={drop.phase === 'live' ? 'Drop live' : 'Programat'}
                  onPress={() => openProduct(drop)}
                />
              ))
            )}
          </OfferSection>

          <OfferSection title="Last minute la ateliere">
            {workshopsError && lastMinuteWorkshops.length === 0 ? (
              <View>
                <EmptyState title="Eroare" description={workshopsError} />
                <Button
                  title="Încearcă din nou"
                  variant="secondary"
                  onPress={() => void refetchWorkshops()}
                />
              </View>
            ) : lastMinuteWorkshops.length === 0 ? (
              <EmptyState
                title="Niciun loc last minute"
                description="Atelierele cu locuri disponibile vor apărea aici."
              />
            ) : (
              lastMinuteWorkshops.map((workshop) => (
                <WorkshopOfferCard
                  key={workshop.id}
                  workshop={workshop}
                  onPress={() => router.push('/(tabs)/workshops')}
                />
              ))
            )}
          </OfferSection>
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { marginBottom: 8 },
  heroTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  heroSub: { marginTop: 8, fontSize: 14, color: '#E8DDD0', lineHeight: 20 },
  loader: { marginTop: 32 },
  section: { marginTop: 20 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.brown,
    marginBottom: 10,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  offerCardPressed: { opacity: 0.9 },
  offerImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: colors.warm,
  },
  offerImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  offerEmoji: { fontSize: 28 },
  offerBody: { flex: 1, minWidth: 0 },
  offerBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.accent,
  },
  offerName: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: colors.brown,
  },
  offerPrice: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: colors.brown,
  },
  offerMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 16,
    color: colors.brownMuted,
  },
})
