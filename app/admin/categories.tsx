import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Button } from '@/components/ui/Button'
import { useAdminProducts } from '@/hooks/use-admin-products'
import type { CategoryInput } from '@/lib/database/queries/categories'
import type { CategoryRow } from '@/types/database'
import { colors } from '@/theme/colors'

const emptyForm: CategoryInput = {
  name: '',
  slug: '',
  image_url: null,
  sort_order: 0,
}

export default function AdminCategoriesScreen() {
  const {
    categories,
    loading,
    saving,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CategoryRow | null>(null)
  const [form, setForm] = useState<CategoryInput>(emptyForm)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(c: CategoryRow) {
    setEditing(c)
    setForm({
      name: c.name,
      slug: c.slug,
      image_url: c.image_url,
      sort_order: c.sort_order,
    })
    setModalOpen(true)
  }

  async function save() {
    try {
      if (editing) await updateCategory(editing.id, form)
      else await createCategory(form)
      setModalOpen(false)
    } catch {
      /* hook handles error */
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    )
  }

  return (
    <View style={styles.flex}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.addBtn} onPress={openCreate}>
        <Text style={styles.addText}>+ Categorie nouă</Text>
      </Pressable>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openEdit(item)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>{item.slug}</Text>
            </View>
            <Pressable
              onPress={() =>
                Alert.alert('Șterge', item.name, [
                  { text: 'Anulează', style: 'cancel' },
                  {
                    text: 'Șterge',
                    style: 'destructive',
                    onPress: () => void deleteCategory(item.id),
                  },
                ])
              }
            >
              <Text style={styles.delete}>Șterge</Text>
            </Pressable>
          </Pressable>
        )}
      />
      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            {editing ? 'Editează categorie' : 'Categorie nouă'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nume"
            value={form.name}
            onChangeText={(name) =>
              setForm((f) => ({
                ...f,
                name,
                slug: f.slug || name.toLowerCase().replace(/\s+/g, '-'),
              }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Slug"
            value={form.slug}
            onChangeText={(slug) => setForm((f) => ({ ...f, slug }))}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Sort order"
            keyboardType="number-pad"
            value={String(form.sort_order)}
            onChangeText={(v) =>
              setForm((f) => ({ ...f, sort_order: Number(v) || 0 }))
            }
          />
          <View style={styles.modalActions}>
            <Button title="Anulează" variant="secondary" onPress={() => setModalOpen(false)} />
            <Button title="Salvează" onPress={() => void save()} loading={saving} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16 },
  addBtn: {
    margin: 16,
    marginBottom: 0,
    padding: 14,
    backgroundColor: colors.accent,
    borderRadius: 12,
    alignItems: 'center',
  },
  addText: { color: colors.white, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontWeight: '700', color: colors.brown },
  meta: { fontSize: 13, color: colors.brownMuted },
  delete: { color: colors.danger },
  error: { color: colors.danger, padding: 16 },
  modal: { flex: 1, padding: 20, backgroundColor: colors.cream },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  modalActions: { gap: 10, marginTop: 16 },
})
