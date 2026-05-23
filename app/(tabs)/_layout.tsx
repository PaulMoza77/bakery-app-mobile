import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { colors } from '@/theme/colors'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.brownMuted,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.cream },
        headerTintColor: colors.brown,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerRight: route.name === 'menu' ? undefined : () => <HeaderActions />,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Produse',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="basket-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Evenimente',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'Personalizează',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workshops"
        options={{
          title: 'Ateliere',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Meniu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
