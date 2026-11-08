// שרת קטן ב-Vercel (חינם): האפליקציה קוראת לו מיד אחרי שנוצרת התראה,
// והוא שולח אותה כ-Push לטלפונים של מי שהיא מיועדת לו.
import { auth, sendPending } from '../lib/push-core.mjs'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    // רק מי שמחובר לאפליקציה יכול לבקש שליחה
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    await auth.verifyIdToken(token)
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.slice(0, 20) : []
    const sent = await sendPending(ids)
    res.status(200).json({ sent })
  } catch (e) {
    console.error(e)
    res.status(400).json({ error: String(e.message || e) })
  }
}
