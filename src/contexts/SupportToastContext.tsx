import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '@/theme/colors'

export type SupportToastKind = 'admin_reply' | 'client_message' | 'thread_closed'

export interface SupportToastPayload {
  kind: SupportToastKind
  title: string
  body?: string
}

interface SupportToastContextValue {
  showToast: (payload: SupportToastPayload) => void
  dismissToast: () => void
}

const SupportToastContext = createContext<SupportToastContextValue | null>(null)

export function SupportToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<SupportToastPayload | null>(null)

  const dismissToast = useCallback(() => setToast(null), [])

  const showToast = useCallback((payload: SupportToastPayload) => {
    setToast(payload)
    setTimeout(() => setToast(null), 4500)
  }, [])

  const value = useMemo(
    () => ({ showToast, dismissToast }),
    [showToast, dismissToast],
  )

  return (
    <SupportToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Pressable style={styles.toast} onPress={dismissToast}>
          <Text style={styles.toastTitle}>{toast.title}</Text>
          {toast.body ? <Text style={styles.toastBody}>{toast.body}</Text> : null}
        </Pressable>
      ) : null}
    </SupportToastContext.Provider>
  )
}

export function useSupportToast(): SupportToastContextValue {
  const ctx = useContext(SupportToastContext)
  if (!ctx) {
    throw new Error('useSupportToast must be used within SupportToastProvider')
  }
  return ctx
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.brown,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    zIndex: 100,
  },
  toastTitle: { color: colors.white, fontWeight: '700', fontSize: 14 },
  toastBody: { color: '#E8DDD0', fontSize: 13, marginTop: 4, lineHeight: 18 },
})
