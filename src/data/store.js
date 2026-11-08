import { useSyncExternalStore } from 'react'

// מאגר נתונים פשוט שנשמר בטלפון.
// בשלב החיבור לשרת (Firebase) נחליף רק את הקובץ הזה, ושאר האפליקציה תישאר אותו דבר.
const PREFIX = 'tzevet-aderet:'
const listeners = new Set()
const cache = {}

function read(key, seed) {
  if (!(key in cache)) {
    let v
    try { v = JSON.parse(localStorage.getItem(PREFIX + key)) } catch { v = null }
    cache[key] = v ?? seed
  }
  return cache[key]
}

export function write(key, value) {
  cache[key] = value
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* מצב פרטי */ }
  listeners.forEach((l) => l())
}

export function useStore(key, seed) {
  const value = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l) },
    () => read(key, seed),
  )
  return [value, (v) => write(key, typeof v === 'function' ? v(read(key, seed)) : v)]
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
