
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
  tribes: ['זרעים', 'נבטים', 'ניצנים', 'מעלות', 'מעפילים', 'הראה', 'שם חדש'],
  rooms: ['החדר הגדול', 'החדר מצד שמאל לכניסה', 'החדר מצד ימין לכניסה', 'מגרש'],
  speakerApproval: false, // כל אחד יכול לקחת כשהרמקול פנוי
}

export const EVENT_TYPES = {
  'פעולה': { color: 'violet', dot: 'bg-violet-500' },
  'טיול': { color: 'green', dot: 'bg-emerald-500' },
  'חודש ארגון': { color: 'orange', dot: 'bg-orange-500' },
  'ישיבת צוות': { color: 'blue', dot: 'bg-blue-500' },
  'שבת סניף': { color: 'teal', dot: 'bg-teal-500' },
}

// בלי אירועי דוגמה: מתחילים ריק, והמנהלים מוסיפים אירועים אמיתיים
export const seedEvents = []

export const DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

// שיבוץ שבועי קבוע: day = 0 (ראשון) עד 6 (שבת)
export const seedBookings = []

// הכיתה של כל שבט, לפי הסדר ברשימת השבטים (הראשון = ג׳)
export const GRADES = ['ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב']

// סיסמת המנהלים, ומי שנרשם כ"קומונרית" הוא תמיד מנהל
export const ADMIN_PASSWORD = '23235'
export const KOMUNARIT = 'קומונרית'
