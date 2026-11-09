import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { online, db, ready } from '../firebase'

// מספר ישראלי לפורמט של וואטסאפ (050-1234567 → 972501234567)
export const waNumber = (p) => (p || '').replace(/\D/g, '').replace(/^0/, '972')
// קישור לוואטסאפ עם הודעה מוכנה (בלי מספר: וואטסאפ נותן לבחור איש קשר)
export const waLink = (phone, text) => `https://wa.me/${phone ? waNumber(phone) : ''}?text=${encodeURIComponent(text)}`

// כל אנשי הצוות שנרשמו. מי שנרשם פעמיים (למשל אחרי התקנה מחדש) מופיע פעם אחת.
// טלפון אחיד: +972-58... → 058...
export const normPhone = (p) => { const d = (p || '').replace(/\D/g, ''); return d.startsWith('972') ? '0' + d.slice(3) : d }

export function dedupe(users) {
  // מאחדים לפי טלפון או לפי שם מלא (לא מוחקים כלום בשרת, רק מציגים פעם אחת)
  const groups = []
  for (const u of users) {
    if (!u.firstName) continue
    const ph = normPhone(u.phone), nm = `${u.firstName} ${u.lastName || ''}`.trim()
    const g = groups.find((x) => (ph && x.phones.has(ph)) || x.names.has(nm))
    if (g) { g.list.push(u); if (ph) g.phones.add(ph); g.names.add(nm) } else groups.push({ phones: new Set(ph ? [ph] : []), names: new Set([nm]), list: [u] })
  }
  // מכל קבוצה מציגים את הרשומה העדכנית ביותר
  return groups.map((g) => g.list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0])
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
