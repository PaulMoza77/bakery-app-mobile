import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { HeaderActions } from '@/components/layout/HeaderActions'
import { useAppTheme } from '@/contexts/BrandingContext'

export default function TabLayout() {
  const theme = useAppTheme()

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.brownMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        headerStyle: { backgroundColor: theme.colors.cream },
        headerTintColor: theme.colors.brown,
        headerTitleStyle: {
          fontWeight: '700',
          fontFamily: theme.fonts.heading,
        },
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
        name="offers"
        options={{
          title: 'Oferte',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customize"
        options={{
          title: 'Torturi',
          tabBarLabel: 'Torturi',
          tabBarAccessibilityLabel: 'Configurator torturi personalizate',
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
