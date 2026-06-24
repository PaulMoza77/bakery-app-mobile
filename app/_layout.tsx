import 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import 'react-native-reanimated'
import { RootNavigator } from '@/components/layout/RootNavigator'
import { SplashGate } from '@/components/layout/SplashGate'
import { AuthProvider } from '@/contexts/AuthContext'
import { BrandingProvider } from '@/contexts/BrandingContext'
import { CartProvider } from '@/contexts/CartContext'
import { NotificationsUnreadProvider } from '@/contexts/NotificationsUnreadContext'
import { SupportToastProvider } from '@/contexts/SupportToastContext'
import { SupportUnreadProvider } from '@/contexts/SupportUnreadContext'

export { ErrorBoundary } from 'expo-router'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <CartProvider>
          <NotificationsUnreadProvider>
            <SupportToastProvider>
              <SupportUnreadProvider>
                <SplashGate>
                  <RootNavigator />
                </SplashGate>
              </SupportUnreadProvider>
            </SupportToastProvider>
          </NotificationsUnreadProvider>
        </CartProvider>
      </BrandingProvider>
    </AuthProvider>
  )
}
