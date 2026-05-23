import { Stack } from 'expo-router'
import { colors } from '@/theme/colors'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.brown,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.cream },
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Autentificare' }} />
      <Stack.Screen name="register" options={{ title: 'Înregistrare' }} />
    </Stack>
  )
}
