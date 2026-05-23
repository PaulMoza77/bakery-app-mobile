const memory = new Map<string, string>()

function hasLocalStorage(): boolean {
  return typeof globalThis.localStorage !== 'undefined'
}

export const appLocalStorage = {
  getItem(key: string): string | null {
    if (hasLocalStorage()) return globalThis.localStorage.getItem(key)
    return memory.get(key) ?? null
  },
  setItem(key: string, value: string): void {
    if (hasLocalStorage()) globalThis.localStorage.setItem(key, value)
    else memory.set(key, value)
  },
  removeItem(key: string): void {
    if (hasLocalStorage()) globalThis.localStorage.removeItem(key)
    else memory.delete(key)
  },
}
