const today = new Date()
const iso = (d) => d.toISOString().slice(0, 10)
const plus = (n) => { const d = new Date(today); d.setDate(d.getDate() + n); return iso(d) }

export const seedAnnouncements = [
  { id: 'welcome', title: 'ברוכים הבאים לצוות אדרת!', body: 'מעכשיו כל ההודעות, האירועים והמספרים החשובים של הצוות נמצאים כאן.', important: false, author: 'הנהלת הסניף', createdAt: Date.now() },
]

export const CONTACT_CATEGORIES = ['חירום', 'מושב', 'סניף', 'תנועה']

export const seedContacts = [
  { id: 'mda', name: 'מד"א', role: 'אמבולנס', phone: '101', category: 'חירום', starred: true },
  { id: 'police', name: 'משטרה', role: '', phone: '100', category: 'חירום', starred: true },
  { id: 'fire', name: 'כיבוי והצלה', role: '', phone: '102', category: 'חירום', starred: false },
]

// הגדרות שהמנהל יכול לשנות מתוך מסך הניהול
export const seedSettings = {
  tribes: ['שבט ד׳', 'שבט ה׳', 'שבט ו׳', 'שבט ז׳', 'שבט ח׳', 'שבט ט׳'],
  rooms: ['חדר גדול', 'חדר קטן', 'מחסן', 'חצר'],
  speakerApproval: true,
}

export const EVENT_TYPES = {
  'פעולה': { color: 'violet', dot: 'bg-violet-500' },
  'טיול': { color: 'green', dot: 'bg-emerald-500' },
  'חודש ארגון': { color: 'orange', dot: 'bg-orange-500' },
  'ישיבת צוות': { color: 'blue', dot: 'bg-blue-500' },
  'שבת סניף': { color: 'teal', dot: 'bg-teal-500' },
}

export const seedEvents = [
  { id: 'e1', title: 'ישיבת צוות', date: plus(2), time: '20:30', place: 'הסניף', type: 'ישיבת צוות', owner: 'הקומונרית', desc: 'סוגרים את התוכנית לחודש הקרוב.', rsvp: {} },
  { id: 'e2', title: 'פעולה שבועית', date: plus(5), time: '16:30', place: 'הסניף', type: 'פעולה', owner: '', desc: '', rsvp: {} },
]

export const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// שיבוץ שבועי קבוע: day = 0 (ראשון) עד 6 (שבת)
export const seedBookings = [
  { id: 'b1', room: 'חדר גדול', day: 6, from: '16:00', to: '17:30', who: 'שבט ז׳' },
  { id: 'b2', room: 'חדר קטן', day: 6, from: '16:00', to: '17:30', who: 'שבט ה׳' },
]
