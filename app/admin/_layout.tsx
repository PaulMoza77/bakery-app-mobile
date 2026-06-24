import { Redirect, Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { AdminBackButton } from '@/components/layout/AdminBackButton'
import { useAuth } from '@/contexts/AuthContext'
import { useAppTheme } from '@/contexts/BrandingContext'

export default function AdminLayout() {
  const { isAdmin, loading, profileLoading, user } = useAuth()
  const theme = useAppTheme()

  if (loading || profileLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator color={theme.colors.accent} />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />
  }

  if (!isAdmin) {
    return <Redirect href="/(tabs)/menu" />
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.cream },
        headerTintColor: theme.colors.brown,
        headerTitleStyle: { fontWeight: '700', fontFamily: theme.fonts.heading },
        headerTitleAlign: 'center',
        headerBackVisible: false,
        headerLeft: () => <AdminBackButton />,
        contentStyle: { backgroundColor: theme.colors.cream },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="products" options={{ title: 'Produse' }} />
      <Stack.Screen name="categories" options={{ title: 'Categorii' }} />
      <Stack.Screen name="orders" options={{ title: 'Comenzi' }} />
      <Stack.Screen name="custom-cakes" options={{ title: 'Torturi' }} />
      <Stack.Screen name="branding" options={{ title: 'Branding' }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
    </Stack>
  )
}
