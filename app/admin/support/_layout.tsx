import { Stack } from 'expo-router'
import { colors } from '@/theme/colors'

export default function AdminSupportLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.brown,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Suport chat' }} />
      <Stack.Screen name="[threadId]" options={{ title: 'Conversație' }} />
    </Stack>
  )
}
