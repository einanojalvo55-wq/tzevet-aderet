import { useStore } from './store'
import { seedAnnouncements, seedContacts } from './seed'

export const useAnnouncements = () => useStore('announcements', seedAnnouncements)
export const useReadIds = () => useStore('readAnnouncements', [])
export const useContacts = () => useStore('contacts', seedContacts)
export const useAdmin = () => useStore('isAdmin', false)

// הודעות חשובות קודם, ואז מהחדשה לישנה
export const sortAnnouncements = (list) =>
  [...list].sort((a, b) => (b.important - a.important) || (b.createdAt - a.createdAt))
