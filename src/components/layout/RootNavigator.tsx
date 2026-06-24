import { Stack } from 'expo-router'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { useAppTheme } from '@/contexts/BrandingContext'

const clientStackHeader = {
  headerBackTitle: 'Meniu',
  headerBackButtonDisplayMode: 'minimal' as const,
  headerRight: () => <HeaderActions />,
}

export function RootNavigator() {
  const theme = useAppTheme()

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.cream },
        headerTintColor: theme.colors.brown,
        headerTitleStyle: { fontWeight: '700', fontFamily: theme.fonts.heading },
        contentStyle: { backgroundColor: theme.colors.cream },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen
        name="product/[id]"
        options={{ title: 'Produs', ...clientStackHeader }}
      />
      <Stack.Screen
        name="products/[section]"
        options={{ title: 'Produse', ...clientStackHeader }}
      />
      <Stack.Screen name="cart" options={{ title: 'Coș', ...clientStackHeader }} />
      <Stack.Screen
        name="orders"
        options={{ title: 'Comenzile mele', ...clientStackHeader }}
      />
      <Stack.Screen name="profile" options={{ title: 'Profil', ...clientStackHeader }} />
      <Stack.Screen name="legal" options={{ title: 'Legal', ...clientStackHeader }} />
      <Stack.Screen name="chat" options={{ headerShown: false }} />
      <Stack.Screen
        name="notifications"
        options={{ title: 'Notificări', ...clientStackHeader }}
      />
      <Stack.Screen
        name="atelier/[type]"
        options={{ title: 'Ateliere', ...clientStackHeader }}
      />
      <Stack.Screen
        name="atelier/product/[id]"
        options={{ title: 'Detalii', ...clientStackHeader }}
      />
      <Stack.Screen
        name="atelier/library"
        options={{ title: 'Biblioteca mea', ...clientStackHeader }}
      />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}
