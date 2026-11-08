// שמירת הפרופיל בטלפון. בשלב החיבור ל-Firebase הפרופיל יישמר גם בשרת,
// כדי שהמנהלים יראו את כל הצוות.
const KEY = 'tzevet-aderet-profile'

// רשימה זמנית. נחליף בשמות השבטים האמיתיים של הסניף.
export const TRIBES = ['שבט ד׳', 'שבט ה׳', 'שבט ו׳', 'שבט ז׳', 'שבט ח׳', 'שבט ט׳']

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
export function saveProfile(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch { /* מצב פרטי בדפדפן */ }
}
export function clearProfile() {
  try { localStorage.removeItem(KEY) } catch { /* */ }
}
