import { useState } from 'react'
import Icon from './Icon'
import { online, enablePush } from '../firebase'

const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
const standalone = window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true
const pushOn = () => { try { return localStorage.getItem('tzevet-aderet:pushOn') === '1' } catch { return false } }

// כרטיס בראש מסך הבית: מזכיר להפעיל התראות עד שהן מופעלות
export default function NotifBanner() {
  const [state, setState] = useState(() => (pushOn() && 'Notification' in window && Notification.permission === 'granted' ? 'done' : 'ask'))
  const [msg, setMsg] = useState('')
  if (!online || state === 'done') return null

  if (isIOS && !standalone) return (
    <div className="mb-4 flex items-start gap-3 rounded-3xl bg-white p-4 shadow-card ring-2 ring-navy-500 dark:bg-navy-900">
      <Icon name="BellRing" size={22} className="mt-0.5 shrink-0 text-navy-500 dark:text-accent-400" />
      <div className="text-sm"><b>כדי לקבל התראות</b>, מוסיפים את האפליקציה למסך הבית (שיתוף ⬆️ ← "הוסף למסך הבית") ופותחים אותה משם.</div>
    </div>
  )

  async function enable() {
    setState('busy')
    try {
      const r = await enablePush()
      if (r === 'granted') { setState('done'); return }
      setState('ask')
      setMsg(r === 'denied' ? 'ההתראות חסומות. אפשר להפעיל בהגדרות הטלפון ← התראות' : 'לא הצלחנו להפעיל. נסו שוב')
    } catch (e) { setState('ask'); setMsg('לא הצלחנו להפעיל: ' + (e?.message || e)) }
  }

  return (
    <div className="mb-4 rounded-3xl bg-gradient-to-l from-accent-500 to-amber-400 p-4 text-white shadow-card">
      <div className="flex items-center gap-3">
        <Icon name="BellRing" size={26} className="shrink-0" />
        <div className="flex-1"><div className="font-extrabold">הפעילו התראות 🔔</div><div className="text-sm text-white/90">כדי לא לפספס הודעות ואישורים</div></div>
        <button onClick={enable} disabled={state === 'busy'} className="rounded-2xl bg-white px-4 py-2 font-bold text-amber-700 shadow active:scale-95">{state === 'busy' ? '...' : 'הפעלה'}</button>
      </div>
      {msg && <div className="mt-2 text-sm font-semibold">{msg}</div>}
    </div>
  )
}
