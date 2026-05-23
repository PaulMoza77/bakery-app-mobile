import { useCallback, useState } from 'react'

export function useAdminMutation() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runMutation = useCallback(
    async (
      fn: () => Promise<void>,
      optimistic?: { apply: () => void; rollback: () => void },
    ) => {
      setSaving(true)
      setError(null)
      optimistic?.apply()
      try {
        await fn()
      } catch (err) {
        optimistic?.rollback()
        const message = err instanceof Error ? err.message : 'Eroare'
        setError(message)
        throw err
      } finally {
        setSaving(false)
      }
    },
    [],
  )

  const clearError = useCallback(() => setError(null), [])

  return { saving, error, setError, clearError, runMutation }
}
