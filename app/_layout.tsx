import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { SplashGate } from '@/components/layout/SplashGate'
import { AuthProvider } from '@/contexts/AuthContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationsUnreadProvider } from '@/contexts/NotificationsUnreadContext'
import { colors } from '@/theme/colors'

const clientStackHeader = {
  headerRight: () => <HeaderActions />,
}

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationsUnreadProvider>
        <SplashGate>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.cream },
            headerTintColor: colors.brown,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: colors.cream },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[id]"
            options={{ title: 'Produs', ...clientStackHeader }}
          />
          <Stack.Screen name="cart" options={{ title: 'Coș', ...clientStackHeader }} />
          <Stack.Screen
            name="orders"
            options={{ title: 'Comenzile mele', ...clientStackHeader }}
          />
          <Stack.Screen name="profile" options={{ title: 'Profil', ...clientStackHeader }} />
          <Stack.Screen name="chat" options={{ title: 'Chat', ...clientStackHeader }} />
          <Stack.Screen
            name="notifications"
            options={{ title: 'Notificări', ...clientStackHeader }}
          />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        </SplashGate>
        </NotificationsUnreadProvider>
      </CartProvider>
    </AuthProvider>
  )
}
