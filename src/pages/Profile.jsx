import { useState } from 'react'
import Icon from '../components/Icon'
import Onboarding from './Onboarding'
import { useAdmin, useNotifPrefs, NOTIF_KINDS, showSystemNotification, notify, fullName } from '../data/hooks'
import { online, enablePush, saveUser } from '../firebase'

/* global __BUILD__ */
const VERSION = new Date(+__BUILD__).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })

const roleName = { owner: 'מנהל ראשי', admin: 'מנהל', member: 'מדריך' }

function Toggle({ on }) {
  return <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${on ? 'justify-start bg-emerald-500' : 'justify-end bg-slate-300 dark:bg-white/20'}`}><span className="h-5 w-5 rounded-full bg-white shadow" /></span>
}

export default function Profile({ profile, onSave, onReset }) {
  const [editing, setEditing] = useState(false)
  const [isAdmin] = useAdmin()
  const [prefs, setPrefs] = useNotifPrefs()
  const [msg, setMsg] = useState('')
  if (editing) return <Onboarding initial={profile} onDone={(p) => { onSave(p); setEditing(false) }} onCancel={() => setEditing(false)} />

  const initials = profile.firstName[0] + (profile.lastName[0] || '')
  const pushOnFlag = (() => { try { return localStorage.getItem('tzevet-aderet:pushOn') === '1' } catch { return false } })()
  const perm = 'Notification' in window && (!online || pushOnFlag) ? Notification.permission : 'default'

  async function enable() {
    if (!('Notification' in window)) return setMsg('בטלפון הזה צריך קודם להוסיף את האפליקציה למסך הבית')
    try {
      const r = await enablePush()
      setMsg(r.startsWith('granted') ? 'ההתראות הופעלו ✓' : 'ההתראות לא אושרו. אפשר לשנות בהגדרות הטלפון')
    } catch (e) { setMsg('לא הצלחנו להפעיל התראות: ' + (e.message || e)) }
  }
  async function test() {
    if (online) {
      notify({ text: 'זו התראת בדיקה. אם רואים אותה, הכול עובד 🎉', kind: 'test', to: fullName(profile), link: '/profile' })
      return setMsg('נשלחה התראת בדיקה. היא תגיע לטלפון תוך כמה דקות')
    }
    const ok = await showSystemNotification('זו התראת בדיקה. אם רואים אותה, הכול עובד 🎉')
    setMsg(ok ? 'נשלחה התראת בדיקה' : 'לא הצלחנו להציג התראה. צריך קודם להפעיל התראות')
  }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <header className="pt-safe py-4"><h1 className="text-2xl font-extrabold">פרופיל</h1></header>
      <div className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-card dark:bg-navy-900">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-navy-800 text-2xl font-extrabold text-white">{initials}</div>
        <div className="mt-3 text-xl font-extrabold">{profile.firstName} {profile.lastName}</div>
        {profile.phone && <div className="text-sm text-slate-500" dir="ltr">{profile.phone}</div>}
        <div className="mt-1 flex gap-2 text-sm">
          <span className="rounded-full bg-navy-100 px-3 py-1 font-semibold text-navy-700 dark:bg-white/10 dark:text-white">{isAdmin ? 'מנהל' : roleName[profile.role]}</span>
          <span className="rounded-full bg-accent-500/15 px-3 py-1 font-semibold text-accent-600 dark:text-accent-400">{profile.tribe}</span>
        </div>
      </div>

      <h2 className="mb-2 mt-6 px-1 text-sm font-bold text-slate-500">התראות</h2>
      <div className="overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-900">
        {perm !== 'granted' && (
          <button onClick={enable} className="flex w-full items-center gap-3 bg-accent-500/10 px-5 py-4 text-right font-bold text-accent-600 dark:text-accent-400">
            <Icon name="BellRing" size={20} /><span className="flex-1">הפעלת התראות בטלפון</span><Icon name="ChevronLeft" size={18} />
          </button>
        )}
        {Object.entries(NOTIF_KINDS).map(([k, label]) => {
          const locked = k === 'important'
          const on = locked || prefs[k] !== false
          return (
            <button key={k} disabled={locked} onClick={() => { const next = { ...prefs, [k]: !on }; setPrefs(next); saveUser({ prefs: next }) }} className="flex w-full items-center gap-3 border-t border-slate-100 px-5 py-3.5 text-right first:border-t-0 dark:border-white/5">
              <span className="flex-1 font-semibold">{label}{locked && <span className="mr-1 text-xs font-normal text-slate-400">(תמיד פועל)</span>}</span><Toggle on={on} />
            </button>
          )
        })}
        <button onClick={test} className="flex w-full items-center gap-3 border-t border-slate-100 px-5 py-4 text-right font-semibold dark:border-white/5">
          <Icon name="Bell" size={20} className="text-navy-500" /><span className="flex-1">שלח לי התראת בדיקה</span>
        </button>
      </div>
      {msg && <p className="mt-2 px-1 text-sm text-slate-500">{msg}</p>}

      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-900">
        <button onClick={() => setEditing(true)} className="flex w-full items-center gap-3 px-5 py-4 text-right font-semibold active:bg-slate-50 dark:active:bg-white/5">
          <Icon name="User" size={20} className="text-navy-500" /> <span className="flex-1">עריכת פרטים</span> <Icon name="ChevronLeft" size={18} className="text-slate-400" />
        </button>
        <div className="h-px bg-slate-100 dark:bg-white/5" />
        <button onClick={() => { if (confirm('לצאת מהפרופיל במכשיר הזה?')) onReset() }} className="flex w-full items-center gap-3 px-5 py-4 text-right font-semibold text-rose-600 active:bg-slate-50 dark:active:bg-white/5">
          <Icon name="LogOut" size={20} /> <span className="flex-1">יציאה</span>
        </button>
      </div>
      <p className="mt-6 text-center text-xs text-slate-400">גרסה {VERSION}</p>
    </div>
  )
}
