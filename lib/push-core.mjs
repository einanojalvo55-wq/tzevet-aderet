// הלוגיקה המשותפת לשליחת התראות Push ותזכורות (משמשת את השרת ב-Vercel ואת GitHub)
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { getAuth } from 'firebase-admin/auth'

if (!getApps().length) initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) })
export const db = getFirestore()
export const auth = getAuth()

async function recipients(to, kind, fromUid) {
  const users = await db.collection('users').get()
  return users.docs.filter((d) => {
    const u = d.data()
    if (!u.tokens?.length) return false
    if (kind !== 'test' && d.id === fromUid) return false // לא שולחים לעצמך
    if (kind !== 'important' && kind !== 'test' && u.prefs?.[kind] === false) return false
    if (to === 'all') return true
    if (to === 'admins') return !!u.isAdmin
    if (to.startsWith('tribe:')) return u.tribe === to.slice(6)
    return u.name === to
  })
}

export async function push(n) {
  const docs = await recipients(n.to || 'all', n.kind, n.from)
  for (const d of docs) {
    const tokens = d.data().tokens
    const res = await getMessaging().sendEachForMulticast({
      tokens,
      data: { title: 'צוות אדרת', body: n.text, link: n.link || '/', id: n.id },
      webpush: { headers: { Urgency: 'high', TTL: '86400' } },
    })
    // מנקים טלפונים שכבר לא רשומים
    const dead = res.responses.map((r, i) => (!r.success && /registration-token-not-registered|invalid-argument/.test(r.error?.code || '') ? tokens[i] : null)).filter(Boolean)
    if (dead.length) await d.ref.update({ tokens: FieldValue.arrayRemove(...dead) })
  }
}


// שולח התראות שעוד לא נשלחו. מסמן כל אחת כ"נשלחה" כדי שלא תישלח פעמיים.
// ids: רשימת מזהים מסוימים, או null = כל מה שנוצר בשעה האחרונה ולא נשלח
export async function sendPending(ids = null) {
  const items = (await db.doc('app/notifications').get()).data()?.items || []
  const hourAgo = Date.now() - 3600000
  const wanted = items.filter((n) => (ids ? ids.includes(n.id) : n.createdAt > hourAgo))
  const stateRef = db.doc('app/pushState')
  const toSend = await db.runTransaction(async (tx) => {
    const sent = new Set((await tx.get(stateRef)).data()?.sentIds || [])
    const fresh = wanted.filter((n) => !sent.has(n.id))
    fresh.forEach((n) => sent.add(n.id))
    if (fresh.length) tx.set(stateRef, { sentIds: [...sent].slice(-500), lastRun: Date.now() })
    return fresh
  })
  for (const n of toSend) await push(n)
  return toSend.length
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

// זמן בישראל, כי האירועים נשמרים בשעון ישראל
function israelTime(date, time) {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = (time || '00:00').split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  const tz = new Date(guess).toLocaleString('en-US', { timeZone: 'Asia/Jerusalem', hour12: false })
  const offset = new Date(tz + ' UTC').getTime() - guess
  return guess - offset
}

export async function reminders() {
  const [ev, lo, sentDoc] = await Promise.all(['events', 'speakerLoans', 'remindersSent'].map((k) => db.doc(`app/${k}`).get()))
  const events = ev.data()?.items || [], loans = lo.data()?.items || []
  const sent = new Set(sentDoc.data()?.items || [])
  const now = Date.now(), out = []
  const add = (key, n) => { if (!sent.has(key)) { sent.add(key); out.push({ id: newId(), createdAt: now, from: null, ...n }) } }

  for (const e of events) {
    const t = israelTime(e.date, e.time)
    if (t <= now) continue
    const label = t - now <= 3600000 ? 'בעוד שעה' : t - now <= 86400000 ? 'מחר' : null
    if (!label) continue
    const key = `${e.id}:${label}`
    const text = `תזכורת: ${e.title} ${label}${e.time ? ` (${e.time})` : ''}`
    // מי שסימן "לא מגיע" לא מקבל תזכורת
    const no = new Set(Object.entries(e.rsvp || {}).filter(([, v]) => v === 'no').map(([k]) => k))
    if (!no.size) add(key, { text, kind: 'event', to: 'all', link: '/events' })
    else if (!sent.has(key)) {
      sent.add(key)
      const users = await db.collection('users').get()
      users.docs.map((d) => d.data().name).filter((n) => n && !no.has(n)).forEach((name) => out.push({ id: newId(), createdAt: now, from: null, text, kind: 'event', to: name, link: '/events' }))
    }
  }
  for (const l of loans.filter((x) => x.status === 'active')) {
    if (now >= l.to - 1800000) add(`${l.id}:due`, { text: 'עוד מעט צריך להחזיר את הרמקול לסניף', kind: 'speaker', to: l.user, link: '/speaker' })
    if (now > l.to + 1800000) add(`${l.id}:late`, { text: `איחור בהחזרת הרמקול: ${l.user}`, kind: 'speaker', to: 'admins', link: '/speaker' })
  }
  if (!out.length) return
  await db.doc('app/remindersSent').set({ items: [...sent].slice(-500) })
  const ref = db.doc('app/notifications')
  await db.runTransaction(async (tx) => {
    const cur = (await tx.get(ref)).data()?.items || []
    tx.set(ref, { items: [...out, ...cur].slice(0, 200), updatedAt: now })
  })
}

