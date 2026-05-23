import { Link, Stack } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Pagină negăsită' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Această pagină nu există.</Text>
        <Link href="/(tabs)" style={styles.link}>
          <Text style={styles.linkText}>Înapoi la produse</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.cream,
  },
  title: { fontSize: 18, fontWeight: '600', color: colors.brown },
  link: { marginTop: 16 },
  linkText: { fontSize: 16, color: colors.accent, fontWeight: '600' },
})
