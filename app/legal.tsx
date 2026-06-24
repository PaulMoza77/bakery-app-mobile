import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Card } from '@/components/ui/Card'
import { Screen } from '@/components/ui/Screen'
import { useAppTheme, useBranding } from '@/contexts/BrandingContext'
import { getLegalSections } from '@/lib/legal/content'

export default function LegalScreen() {
  const { settings } = useBranding()
  const theme = useAppTheme()
  const sections = getLegalSections(settings.app_name)

  return (
    <Screen scroll={false} padded={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: theme.colors.brownMuted }]}>
          Documente informative conform legislației din România (GDPR, comerț electronic,
          protecția consumatorilor). Citiți cu atenție înainte de a utiliza serviciile noastre.
        </Text>

        {sections.map((section) => (
          <Card key={section.id} style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: theme.colors.brown, fontFamily: theme.fonts.heading },
              ]}
            >
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                style={[styles.paragraph, { color: theme.colors.brown }]}
              >
                {paragraph}
              </Text>
            ))}
          </Card>
        ))}
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32 },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
})
