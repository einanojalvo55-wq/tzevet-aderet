export const seedAnnouncements = [
  { id: 'welcome', title: 'ברוכים הבאים לצוות אדרת!', body: 'מעכשיו כל ההודעות, האירועים והמספרים החשובים של הצוות נמצאים כאן.', important: false, author: 'הנהלת הסניף', createdAt: Date.now() },
]

export const CONTACT_CATEGORIES = ['חירום', 'מושב', 'סניף', 'תנועה']

export const seedContacts = [
  { id: 'mda', name: 'מד"א', role: 'אמבולנס', phone: '101', category: 'חירום', starred: true },
  { id: 'police', name: 'משטרה', role: '', phone: '100', category: 'חירום', starred: true },
  { id: 'fire', name: 'כיבוי והצלה', role: '', phone: '102', category: 'חירום', starred: false },
]
