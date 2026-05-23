import { Redirect, Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/theme/colors'

export default function AdminLayout() {
  const { isAdmin, loading, profileLoading, user } = useAuth()

  if (loading || profileLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={colors.accent} />
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
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.brown,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Admin' }} />
      <Stack.Screen name="products" options={{ title: 'Produse' }} />
      <Stack.Screen name="categories" options={{ title: 'Categorii' }} />
      <Stack.Screen name="orders" options={{ title: 'Comenzi' }} />
      <Stack.Screen name="custom-cakes" options={{ title: 'Torturi' }} />
      <Stack.Screen name="support" options={{ headerShown: false }} />
    </Stack>
  )
}
