// הקוד שרץ בשרת של Firebase:
// 1. כל התראה חדשה באפליקציה נשלחת כ-Push לטלפונים של מי שהיא מיועדת לו.
// 2. כל 15 דקות: תזכורות לאירועים (יום ושעה לפני) ולהחזרת הרמקול.
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

initializeApp()
const db = getFirestore()
const REGION = 'europe-west1'

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

async function push(n) {
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

export const sendPush = onDocumentWritten({ document: 'app/notifications', region: REGION }, async (event) => {
  const before = new Set((event.data.before.data()?.items || []).map((n) => n.id))
  const fresh = (event.data.after.data()?.items || []).filter((n) => !before.has(n.id))
  for (const n of fresh) await push(n)
})

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

export const reminders = onSchedule({ schedule: 'every 15 minutes', region: REGION, timeZone: 'Asia/Jerusalem' }, async () => {
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
})
