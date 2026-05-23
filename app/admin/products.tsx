import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { Button } from '@/components/ui/Button'
import { Screen } from '@/components/ui/Screen'
import { useAdminProducts } from '@/hooks/use-admin-products'
import { formatPrice } from '@/lib/format/currency'
import { getCategoryName } from '@/lib/database/mappers'
import type { ProductInput } from '@/lib/database/queries/products'
import type { ProductWithCategory } from '@/types/database'
import { colors } from '@/theme/colors'

const emptyForm: ProductInput = {
  category_id: null,
  name: '',
  description: '',
  price: 0,
  image_url: null,
  is_active: true,
  is_preorder: false,
}

export default function AdminProductsScreen() {
  const {
    products,
    categories,
    loading,
    saving,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useAdminProducts()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<ProductWithCategory | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm)

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(p: ProductWithCategory) {
    setEditing(p)
    setForm({
      category_id: p.category_id,
      name: p.name,
      description: p.description,
      price: p.price,
      image_url: p.image_url,
      is_active: p.is_active,
      is_preorder: p.is_preorder,
    })
    setModalOpen(true)
  }

  async function save() {
    const priceCents = Math.round(Number(form.price))
    const payload = { ...form, price: priceCents }
    try {
      if (editing) await updateProduct(editing.id, payload)
      else await createProduct(payload)
      setModalOpen(false)
    } catch {
      /* error in hook */
    }
  }

  function confirmDelete(p: ProductWithCategory) {
    Alert.alert('Șterge produs', `Ștergi „${p.name}"?`, [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: () => void deleteProduct(p.id),
      },
    ])
  }

  if (loading) {
    return (
      <Screen scroll={false} padded={false}>
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      </Screen>
    )
  }

  return (
    <View style={styles.flex}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable style={styles.addBtn} onPress={openCreate}>
        <Text style={styles.addText}>+ Produs nou</Text>
      </Pressable>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openEdit(item)}>
            <View style={styles.rowBody}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {getCategoryName(item) ?? '—'} · {formatPrice(item.price)}
              </Text>
              <Text style={styles.meta}>
                {item.is_active ? 'Activ' : 'Inactiv'}
                {item.is_preorder ? ' · Precomandă' : ''}
              </Text>
            </View>
            <Pressable onPress={() => confirmDelete(item)}>
              <Text style={styles.delete}>Șterge</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Modal visible={modalOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>
            {editing ? 'Editează produs' : 'Produs nou'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nume"
            value={form.name}
            onChangeText={(name) => setForm((f) => ({ ...f, name }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Descriere"
            value={form.description ?? ''}
            onChangeText={(description) => setForm((f) => ({ ...f, description }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Preț (bani, ex: 2500 = 25 RON)"
            keyboardType="number-pad"
            value={String(form.price)}
            onChangeText={(v) => setForm((f) => ({ ...f, price: Number(v) || 0 }))}
          />
          <Text style={styles.label}>Categorie</Text>
          <View style={styles.chips}>
            <Pressable
              style={[styles.chip, !form.category_id && styles.chipOn]}
              onPress={() => setForm((f) => ({ ...f, category_id: null }))}
            >
              <Text>—</Text>
            </Pressable>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.chip, form.category_id === c.id && styles.chipOn]}
                onPress={() => setForm((f) => ({ ...f, category_id: c.id }))}
              >
                <Text>{c.name}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.switchRow}>
            <Text>Activ</Text>
            <Switch
              value={form.is_active}
              onValueChange={(is_active) => setForm((f) => ({ ...f, is_active }))}
            />
          </View>
          <View style={styles.switchRow}>
            <Text>Precomandă</Text>
            <Switch
              value={form.is_preorder}
              onValueChange={(is_preorder) => setForm((f) => ({ ...f, is_preorder }))}
            />
          </View>
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
  list: { padding: 16, paddingBottom: 40 },
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
  rowBody: { flex: 1 },
  name: { fontWeight: '700', color: colors.brown, fontSize: 16 },
  meta: { fontSize: 13, color: colors.brownMuted, marginTop: 2 },
  delete: { color: colors.danger, fontSize: 13 },
  error: { color: colors.danger, padding: 16 },
  modal: { flex: 1, padding: 20, backgroundColor: colors.cream },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: colors.brown },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
  label: { fontWeight: '600', marginBottom: 6, color: colors.brown },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipOn: { borderColor: colors.accent, backgroundColor: '#FFF5F2' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalActions: { gap: 10, marginTop: 16 },
})
