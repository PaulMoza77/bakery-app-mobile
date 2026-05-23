import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text } from 'react-native'
import { Screen } from '@/components/ui/Screen'
import { colors } from '@/theme/colors'

const links = [
  { href: '/admin/products', label: 'Produse', desc: 'CRUD produse active' },
  { href: '/admin/categories', label: 'Categorii', desc: 'CRUD categorii' },
  { href: '/admin/orders', label: 'Comenzi', desc: 'Status și detalii' },
  { href: '/admin/custom-cakes', label: 'Torturi personalizate', desc: 'Comenzi customize' },
  { href: '/admin/support', label: 'Suport chat', desc: 'Inbox și răspunsuri clienți' },
] as const

export default function AdminDashboard() {
  const router = useRouter()

  return (
    <Screen>
      <Text style={styles.intro}>
        Panou administrare — aceleași date ca aplicația web, adaptat pentru mobil.
      </Text>
      {links.map((link) => (
        <Pressable
          key={link.href}
          style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}
          onPress={() => router.push(link.href)}
        >
          <Text style={styles.label}>{link.label}</Text>
          <Text style={styles.desc}>{link.desc}</Text>
        </Pressable>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, color: colors.brownMuted, marginBottom: 16, lineHeight: 20 },
  row: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  label: { fontSize: 17, fontWeight: '700', color: colors.brown },
  desc: { fontSize: 13, color: colors.brownMuted, marginTop: 4 },
})
