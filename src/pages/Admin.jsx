import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { field, primaryBtn } from '../components/Sheet'
import { saveUser } from '../firebase'
import { useAdmin, useSettings, useReports, useLoans, useEvents } from '../data/hooks'
import { todayISO } from '../data/dates'

// סיסמת המנהלים (אפשר להחליף כאן)
const ADMIN_PASSWORD = '23235'
const LOCK_KEY = 'tzevet-aderet:adminLock'
const getLock = () => { try { return JSON.parse(localStorage.getItem(LOCK_KEY)) || { fails: 0, until: 0 } } catch { return { fails: 0, until: 0 } } }
const setLock = (v) => { try { localStorage.setItem(LOCK_KEY, JSON.stringify(v)) } catch { /* */ } }

export default function Admin() {
  const [isAdmin, setAdmin] = useAdmin()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState('')

  function submit(e) {
    e.preventDefault()
    const lock = getLock()
    if (lock.until > Date.now()) return setErr(`יותר מדי ניסיונות. נסו שוב בעוד ${Math.ceil((lock.until - Date.now()) / 60000)} דקות`)
    const ok = pw.trim() === ADMIN_PASSWORD
    if (ok) { setLock({ fails: 0, until: 0 }); setAdmin(true); saveUser({ isAdmin: true }).catch(() => {}); return }
    const fails = lock.fails + 1
    setLock(fails >= 5 ? { fails: 0, until: Date.now() + 15 * 60000 } : { fails, until: 0 })
    setErr(fails >= 5 ? 'יותר מדי ניסיונות. המסך נעול ל-15 דקות' : 'סיסמה שגויה')
    setPw('')
  }

  if (!isAdmin) return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="ניהול" />
      <form onSubmit={submit}
        className="mt-4 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-900">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-white"><Icon name="Lock" size={28} /></div>
        <div className="mt-4 text-lg font-bold">אזור מוגן</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">הקלידו את סיסמת הניהול כדי להיכנס</p>
        <input type="password" inputMode="numeric" value={pw} onChange={(e) => { setPw(e.target.value); setErr('') }} placeholder="סיסמה" className={`${field} mt-5 text-center text-lg`} />
        {err && <p className="mt-2 text-sm font-medium text-rose-600">{err}</p>}
        <button disabled={!pw} className={`${primaryBtn} mt-3`}>כניסה</button>
      </form>
    </div>
  )

  return <AdminPanel onExit={() => { setAdmin(false); saveUser({ isAdmin: false }).catch(() => {}) }} />
}

function ListEditor({ title, items, onChange, placeholder }) {
  const [v, setV] = useState('')
  const add = () => { const t = v.trim(); if (t && !items.includes(t)) onChange([...items, t]); setV('') }
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
      <div className="mb-2 font-extrabold">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => (
          <span key={it} className="flex items-center gap-1 rounded-full bg-slate-100 py-1.5 pl-2 pr-3 text-sm font-semibold dark:bg-white/10">
            {it}
            <button onClick={() => { if (items.length > 1 && confirm(`למחוק את "${it}"?`)) onChange(items.filter((x) => x !== it)) }} className="text-slate-400" aria-label="מחיקה"><Icon name="X" size={14} /></button>
          </span>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className={`${field} py-2.5`} value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder={placeholder} />
        <button onClick={add} className="grid w-12 shrink-0 place-items-center rounded-2xl bg-navy-700 text-white dark:bg-accent-500 dark:text-navy-950" aria-label="הוספה"><Icon name="Plus" size={20} /></button>
      </div>
    </div>
  )
}

function AdminPanel({ onExit }) {
  const [settings, setSettings] = useSettings()
  const [reports] = useReports()
  const [loans] = useLoans()
  const [events] = useEvents()
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const stats = [
    { label: 'דיווחים פתוחים', value: reports.filter((r) => r.status !== 'done').length, to: '/reports' },
    { label: 'השאלות החודש', value: loans.filter((l) => l.createdAt >= monthStart.getTime() && l.status !== 'rejected').length, to: '/speaker' },
    { label: 'מחכות לאישור', value: loans.filter((l) => l.status === 'pending').length, to: '/speaker' },
    { label: 'אירועים קרובים', value: events.filter((e) => e.date >= todayISO()).length, to: '/events' },
  ]
  const links = [
    { to: '/announcements', icon: 'Megaphone', title: 'פרסום הודעות' },
    { to: '/events', icon: 'CalendarDays', title: 'יצירת אירועים ואישורי הגעה' },
    { to: '/rooms', icon: 'DoorOpen', title: 'שיבוץ חדרים' },
    { to: '/speaker', icon: 'Speaker', title: 'אישור השאלות רמקול' },
    { to: '/reports', icon: 'ClipboardList', title: 'טיפול בדיווחים' },
    { to: '/contacts', icon: 'Phone', title: 'עריכת מספרים חשובים' },
    { to: '/links', icon: 'Link', title: 'עריכת קישורים חשובים' },
  ]
  return (
    <div className="page-in mx-auto max-w-md space-y-4 px-4 pb-28">
      <PageHeader title="ניהול" />
      <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Icon name="ShieldCheck" size={24} /><div className="font-bold">מצב ניהול פעיל במכשיר הזה</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Link key={s.label} to={s.to} className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
            <div className="text-3xl font-extrabold text-navy-700 dark:text-accent-400">{s.value}</div>
            <div className="text-sm font-semibold text-slate-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
        {links.map((i) => (
          <Link key={i.to} to={i.to} className="flex items-center gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-white/5">
            <Icon name={i.icon} size={20} className="text-navy-500 dark:text-accent-400" />
            <div className="flex-1 font-bold">{i.title}</div>
            <Icon name="ChevronLeft" size={18} className="text-slate-400" />
          </Link>
        ))}
      </div>

      <button onClick={() => setSettings({ ...settings, speakerApproval: !settings.speakerApproval })} className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-right shadow-card dark:bg-navy-900">
        <Icon name="Speaker" size={20} className="text-emerald-600" />
        <div className="flex-1"><div className="font-extrabold">אישור מנהל להשאלת רמקול</div><div className="text-sm text-slate-500">{settings.speakerApproval ? 'כל בקשה מחכה לאישור' : 'כל מדריך לוקח מיד, בלי אישור'}</div></div>
        <span className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${settings.speakerApproval ? 'justify-start bg-emerald-500' : 'justify-end bg-slate-300 dark:bg-white/20'}`}><span className="h-5 w-5 rounded-full bg-white shadow" /></span>
      </button>

      <ListEditor title="שבטים" items={settings.tribes} onChange={(tribes) => setSettings({ ...settings, tribes })} placeholder="שם שבט חדש" />
      <ListEditor title="חדרים בסניף" items={settings.rooms} onChange={(rooms) => setSettings({ ...settings, rooms })} placeholder="שם חדר חדש" />

      <Link to="/team" className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
        <Icon name="Users" size={20} className="text-navy-500 dark:text-accent-400" />
        <div className="flex-1"><div className="font-extrabold">אנשי הצוות</div><div className="text-sm text-slate-500">רשימת כל מי שנרשם, והסרה של מי שלא שייך</div></div>
        <Icon name="ChevronLeft" size={18} className="text-slate-400" />
      </Link>
      <button onClick={onExit} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-bold text-rose-600 shadow-card dark:bg-navy-900">
        <Icon name="Unlock" size={18} /> יציאה ממצב ניהול
      </button>
    </div>
  )
}
