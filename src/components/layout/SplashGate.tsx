import * as SplashScreen from 'expo-splash-screen'
import { useEffect, type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'

export function SplashGate({ children }: { children: ReactNode }) {
  const { loading: authLoading } = useAuth()
  const { hydrated } = useCart()

  useEffect(() => {
    if (!authLoading && hydrated) {
      void SplashScreen.hideAsync()
    }
  }, [authLoading, hydrated])

  return children
}
