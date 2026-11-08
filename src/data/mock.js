// נתוני דוגמה לשלב 1. בשלב 2 הם יוחלפו בנתונים אמיתיים מ-Firebase.

export const latestAnnouncement = {
  title: 'ישיבת צוות ביום חמישי ב-20:30',
  body: 'מגיעים כולם, נסגור את התוכנית לחודש ארגון.',
  important: true,
  unread: true,
}

export const tiles = [
  { id: 'announcements', title: 'הודעות', icon: 'Megaphone', color: 'blue', badge: 2, sub: '2 הודעות לא נקראו' },
  { id: 'events', title: 'אירועים', icon: 'CalendarDays', color: 'violet', sub: 'פעולה · שבת, 16:30' },
  { id: 'rooms', title: 'שיבוץ חדרים', icon: 'DoorOpen', color: 'teal', sub: 'השבוע: חדר גדול' },
  { id: 'speaker', title: 'רמקול', icon: 'Speaker', color: 'green', sub: 'פנוי בסניף', dot: 'green' },
  { id: 'reports', title: 'דיווחים', icon: 'ClipboardList', color: 'orange', badge: 3, sub: '3 דיווחים פתוחים' },
  { id: 'contacts', title: 'מספרים חשובים', icon: 'Phone', color: 'rose', sub: 'גישה מהירה' },
  { id: 'admin', title: 'ניהול', icon: 'Settings', color: 'slate', sub: 'כניסה עם סיסמה', locked: true, wide: true },
]
