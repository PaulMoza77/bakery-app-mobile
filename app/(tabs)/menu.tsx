import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { AdminPanelCard } from '@/components/menu/AdminPanelCard'
import { MenuSkeleton } from '@/components/menu/MenuSkeleton'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Screen } from '@/components/ui/Screen'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { colors } from '@/theme/colors'

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  desc: string
  href?: string
}

export default function MenuTab() {
  const router = useRouter()
  const {
    user,
    profile,
    isAdmin,
    signOut,
    loading,
    profileLoading,
    profileError,
    roleResolved,
    refreshProfile,
  } = useAuth()
  const { itemCount, hydrated } = useCart()

  useFocusEffect(
    useCallback(() => {
      if (user) {
        void refreshProfile(true)
      }
    }, [user, refreshProfile]),
  )

  const showSkeleton = loading || (Boolean(user) && profileLoading && !profile)
  const showAdminPanel = Boolean(user) && roleResolved && isAdmin
  const cartDesc =
    hydrated && itemCount > 0 ? `${itemCount} articole în coș` : 'Vezi coșul'

  const displayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Oaspete'

  const items: MenuItem[] = [
    {
      icon: 'bag-outline',
      label: 'Coș',
      desc: cartDesc,
      href: '/cart',
    },
    {
      icon: 'person-outline',
      label: 'Profil',
      desc: user ? 'Date cont' : 'Autentificare necesară',
      href: user ? '/profile' : '/(auth)/login',
    },
    {
      icon: 'cube-outline',
      label: 'Comenzile mele',
      desc: 'Produse și torturi personalizate',
      href: user ? '/orders' : '/(auth)/login',
    },
  ]

  function openItem(item: MenuItem) {
    if (item.href) router.push(item.href as never)
  }

  if (showSkeleton) {
    return (
      <Screen>
        <MenuSkeleton />
      </Screen>
    )
  }

  return (
    <Screen>
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileText}>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{user?.email ?? 'Neautentificat'}</Text>
          {user && roleResolved && isAdmin ? (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>Administrator</Text>
            </View>
          ) : null}
        </View>
      </Card>

      {profileError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{profileError}</Text>
          <Button
            title="Reîncearcă"
            variant="secondary"
            onPress={() => void refreshProfile()}
          />
        </View>
      ) : null}

      {items.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => openItem(item)}
        >
          <Ionicons name={item.icon} size={22} color={colors.accent} />
          <View style={styles.rowBody}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowDesc}>{item.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.brownMuted} />
        </Pressable>
      ))}

      {showAdminPanel ? (
        <AdminPanelCard onPress={() => router.push('/admin')} />
      ) : null}

      {!user && (
        <View style={styles.authActions}>
          <Button title="Autentificare" onPress={() => router.push('/(auth)/login')} />
          <Button
            title="Înregistrare"
            variant="secondary"
            onPress={() => router.push('/(auth)/register')}
          />
        </View>
      )}

      {user && (
        <Button title="Deconectare" variant="ghost" onPress={() => void signOut()} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.warm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.brown },
  profileText: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700', color: colors.brown },
  email: { fontSize: 13, color: colors.brownMuted, marginTop: 2 },
  adminBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF0EB',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  rowPressed: { opacity: 0.85 },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 16, fontWeight: '600', color: colors.brown },
  rowDesc: { fontSize: 13, color: colors.brownMuted, marginTop: 2 },
  authActions: { gap: 10, marginTop: 16, marginBottom: 8 },
  errorBanner: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FEF3F2',
    borderWidth: 1,
    borderColor: '#FECDCA',
    gap: 8,
  },
  errorText: { fontSize: 14, color: colors.danger, lineHeight: 20 },
})
