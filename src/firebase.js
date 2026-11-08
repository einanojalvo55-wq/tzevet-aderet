import { firebaseConfig, vapidKey, pushUrl } from './firebase-config'
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, doc, setDoc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { getMessaging, getToken, isSupported } from 'firebase/messaging'

// האם מחוברים לשרת
export const online = !!firebaseConfig

let app, auth, db
if (online) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  let cache
  try { cache = persistentLocalCache() } catch { cache = undefined }
  db = initializeFirestore(app, cache ? { localCache: cache } : {})
}
export { db }

// כניסה שקופה: כל טלפון מקבל מזהה קבוע, בלי סיסמה ובלי חשבון גוגל
export const ready = online
  ? new Promise((resolve) => {
      onAuthStateChanged(auth, (u) => {
        if (u) resolve(u)
        else signInAnonymously(auth).catch((e) => console.warn('auth', e))
      })
    })
  : Promise.resolve(null)

export const uid = () => auth?.currentUser?.uid

export async function saveUser(data) {
  if (!online) return
  const u = await ready
  await setDoc(doc(db, 'users', u.uid), { ...data, updatedAt: Date.now() }, { merge: true })
}

// התראות Push: מבקש הרשאה, רושם את הטלפון ושומר אותו בשרת
export async function enablePush() {
  if (!('Notification' in window)) return 'unsupported'
  const perm = await Notification.requestPermission()
  if (perm !== 'granted') return perm
  if (!online || !vapidKey || !(await isSupported())) return 'granted-local'
  const reg = await navigator.serviceWorker.register(`./firebase-messaging-sw.js?config=${encodeURIComponent(JSON.stringify(firebaseConfig))}`)
  const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: reg })
  const u = await ready
  await updateDoc(doc(db, 'users', u.uid), { tokens: arrayUnion(token) })
  return 'granted'
}

// תמונות נשמרות כמסמך נפרד כדי לא להכביד על הרשימות
export async function saveImage(id, data) {
  await ready
  await setDoc(doc(db, 'images', id), { data })
}
export async function loadImage(id) {
  await ready
  const s = await getDoc(doc(db, 'images', id))
  return s.exists() ? s.data().data : null
}

// מבקש מהשרת לשלוח מיד את ההתראה לטלפונים (אם השרת לא זמין, GitHub ישלח אחר כך)
export async function pushNow(id) {
  if (!online || !pushUrl) return
  try {
    const u = await ready
    const token = await u.getIdToken()
    await fetch(pushUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ids: [id] }) })
  } catch { /* השרת לא זמין, הגיבוי ב-GitHub ישלח */ }
}
