import { saveUser } from '../firebase'

// הפרופיל נשמר בטלפון וגם בשרת, כדי שהמנהלים יראו את כל הצוות
const KEY = 'tzevet-aderet-profile'

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
export function saveProfile(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* מצב פרטי בדפדפן */ }
  saveUser({ firstName: p.firstName, lastName: p.lastName, name: `${p.firstName} ${p.lastName}`, tribe: p.tribe, phone: p.phone || '', createdAt: p.createdAt || Date.now() }).catch((e) => console.warn(e))
}
export function clearProfile() {
  try { localStorage.removeItem(KEY) } catch { /* */ }
}
