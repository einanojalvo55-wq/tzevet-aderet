import { useSyncExternalStore } from 'react'
import { doc, onSnapshot, runTransaction } from 'firebase/firestore'
import { online, db, ready } from '../firebase'

// מאגר הנתונים של האפליקציה.
// נתונים משותפים (הודעות, אירועים...) מסונכרנים בזמן אמת דרך השרת לכל הטלפונים.
// נתונים אישיים (מה קראתי, הגדרות התראות) נשמרים רק בטלפון.
const SHARED = new Set(['announcements', 'contacts', 'settings', 'events', 'speakerLoans', 'roomBookings', 'reports', 'notifications', 'links', 'refunds'])
const PREFIX = 'tzevet-aderet:'
const listeners = new Set()
const cache = {}
const seeds = {}
const subscribed = new Set()
const emit = () => listeners.forEach((l) => l())

function local(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* מצב פרטי */ }
}

function read(key) {
  if (!(key in cache)) {
    let v
    try { v = JSON.parse(localStorage.getItem(PREFIX + key)) } catch { v = null }
    cache[key] = v ?? seeds[key]
  }
  return cache[key]
}

function subscribe(key) {
  if (!online || !SHARED.has(key) || subscribed.has(key)) return
  subscribed.add(key)
  ready.then(() => onSnapshot(doc(db, 'app', key), (s) => {
    cache[key] = s.exists() ? s.data().items : seeds[key]
    local(key, cache[key])
    emit()
  }, (e) => console.warn('sync', key, e)))
}

export function write(key, update) {
  const apply = (cur) => (typeof update === 'function' ? update(cur) : update)
  cache[key] = apply(read(key))
  local(key, cache[key])
  emit()
  if (online && SHARED.has(key)) {
    // שמירה בשרת בטרנזקציה, כדי ששני אנשים שמעדכנים יחד לא ימחקו אחד לשני
    return ready.then(() => runTransaction(db, async (tx) => {
      const ref = doc(db, 'app', key)
      const s = await tx.get(ref)
      tx.set(ref, { items: apply(s.exists() ? s.data().items : seeds[key]), updatedAt: Date.now() })
    })).catch((e) => { console.warn('save', key, e); alert('השמירה בשרת נכשלה. בדקו חיבור לאינטרנט ונסו שוב.') })
  }
}

export function useStore(key, seed) {
  if (!(key in seeds)) seeds[key] = seed
  subscribe(key)
  const value = useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => read(key))
  return [value, (v) => write(key, v)]
}

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
