import { useStore, write, newId } from './store'
import { online, uid, pushNow } from '../firebase'
import { seedAnnouncements, seedContacts, seedEvents, seedSettings, seedBookings, GRADES } from './seed'
import { loadProfile } from './profile'

export const useAnnouncements = () => useStore('announcements', seedAnnouncements)
export const useReadIds = () => useStore('readAnnouncements', [])
export const useContacts = () => useStore('contacts', seedContacts)
export const useLinks = () => useStore('links', [])
export const useAdmin = () => useStore('isAdmin', false)
export const useSettings = () => useStore('settings', seedSettings)
export const useEvents = () => useStore('events', seedEvents)
export const useLoans = () => useStore('speakerLoans', [])
export const useBookings = () => useStore('roomBookings', seedBookings)
export const useReports = () => useStore('reports', [])
export const useRefunds = () => useStore('refunds', [])
export const useNotifications = () => useStore('notifications', [])
export const useNotifSeen = () => useStore('notificationsSeen', 0)
export const useNotifPrefs = () => useStore('notifPrefs', {})

export const fullName = (p) => `${p.firstName} ${p.lastName}`

// הודעות חשובות קודם, ואז מהחדשה לישנה
export const sortAnnouncements = (list) =>
  [...list].sort((a, b) => (b.important - a.important) || (b.createdAt - a.createdAt))

// סוגי התראות (אפשר לכבות כל סוג בפרופיל, חוץ מ"חשוב")
export const NOTIF_KINDS = {
  announcement: 'הודעות כלליות',
  important: 'הודעות חשובות',
  event: 'אירועים ותזכורות',
  room: 'שינויים בשיבוץ חדרים',
  speaker: 'השאלת הרמקול',
  report: 'דיווחים',
  refund: 'החזרים כספיים',
}

// to: 'all' | 'admins' | 'tribe:<שבט>' | '<שם מלא>'
export function isForMe(n, profile, isAdmin) {
  if (!profile) return false
  if (n.to === 'all') return true
  if (n.to === 'admins') return isAdmin
  if (n.to.startsWith('tribe:')) return n.to.slice(6) === profile.tribe
  return n.to === fullName(profile)
}

// יוצר התראה. כרגע נשמרת במכשיר ומוצגת כהתראת מערכת אם יש הרשאה.
// כשנחבר שרת, אותה פונקציה תשלח התראת Push לטלפונים של הצוות.
export function notify({ text, kind, to = 'all', link = '/' }) {
  const id = newId()
  const saved = write('notifications', (list) => [{ id, text, kind, to, link, from: uid() || null, createdAt: Date.now() }, ...(list || [])].slice(0, 200))
  // עם שרת: ההתראה לטלפונים נשלחת מהשרת (Push), גם כשהאפליקציה סגורה
  if (online) { Promise.resolve(saved).then(() => pushNow(id)); return }
  const profile = loadProfile()
  let isAdmin = false, prefs = {}
  try { isAdmin = JSON.parse(localStorage.getItem('tzevet-aderet:isAdmin')); prefs = JSON.parse(localStorage.getItem('tzevet-aderet:notifPrefs')) || {} } catch { /* */ }
  if (prefs[kind] === false || !isForMe({ to }, profile, isAdmin)) return
  showSystemNotification(text)
}

export async function showSystemNotification(text) {
  try {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false
    const reg = await navigator.serviceWorker?.getRegistration?.()
    if (reg) await reg.showNotification('צוות אדרת', { body: text, lang: 'he', dir: 'rtl' })
    else new Notification('צוות אדרת', { body: text, lang: 'he', dir: 'rtl' })
    return true
  } catch { return false }
}

// "מעלות" → "כיתה ו׳" (לפי המקום ברשימת השבטים)
export function useGradeOf() {
  const [{ tribes }] = useSettings()
  return (t) => {
    // אם הכיתה כבר כתובה בשם (למשל "ג זרעים"), לא מוסיפים אותה שוב
    if (!t || t.includes('כיתה') || /^([א-ט]|י[אב]?)['׳״"]?\s/.test(t)) return ''
    const i = tribes.indexOf(t)
    return i >= 0 && GRADES[i] ? `כיתה ${GRADES[i]}` : ''
  }
}
