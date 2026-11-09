import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { online, db, ready } from '../firebase'

// מספר ישראלי לפורמט של וואטסאפ (050-1234567 → 972501234567)
export const waNumber = (p) => (p || '').replace(/\D/g, '').replace(/^0/, '972')
// קישור לוואטסאפ עם הודעה מוכנה (בלי מספר: וואטסאפ נותן לבחור איש קשר)
export const waLink = (phone, text) => `https://wa.me/${phone ? waNumber(phone) : ''}?text=${encodeURIComponent(text)}`

// כל אנשי הצוות שנרשמו. מי שנרשם פעמיים (למשל אחרי התקנה מחדש) מופיע פעם אחת.
export function dedupe(users) {
  const best = new Map()
  for (const u of users) {
    if (!u.firstName) continue
    const key = (u.phone || '').replace(/\D/g, '') || `${u.firstName} ${u.lastName}`
    const cur = best.get(key)
    if (!cur || (u.updatedAt || 0) > (cur.updatedAt || 0)) best.set(key, u)
  }
  return [...best.values()]
}

export function useTeam(profile) {
  const [team, setTeam] = useState(online ? null : [{ id: 'me', ...profile, name: `${profile.firstName} ${profile.lastName}` }])
  useEffect(() => {
    if (!online) return
    let unsub = () => {}
    ready.then(() => { unsub = onSnapshot(collection(db, 'users'), (s) => setTeam(dedupe(s.docs.map((d) => ({ id: d.id, ...d.data() }))))) })
    return () => unsub()
  }, [])
  return team
}
