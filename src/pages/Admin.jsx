import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { field, primaryBtn } from '../components/Sheet'
import { useAdmin } from '../data/hooks'

// סיסמה זמנית לתצוגה המקדימה בלבד. כשנחבר שרת היא תיבדק בשרת ולא תהיה בקוד.
const TEMP_PASSWORD = '1234'

export default function Admin() {
  const [isAdmin, setAdmin] = useAdmin()
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)

  if (!isAdmin) return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="ניהול" />
      <form onSubmit={(e) => { e.preventDefault(); if (pw === TEMP_PASSWORD) setAdmin(true); else { setErr(true); setPw('') } }}
        className="mt-4 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-900">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-white"><Icon name="Lock" size={28} /></div>
        <div className="mt-4 text-lg font-bold">אזור מוגן</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">הקלידו את סיסמת הניהול כדי להיכנס</p>
        <input type="password" inputMode="numeric" value={pw} onChange={(e) => { setPw(e.target.value); setErr(false) }} placeholder="סיסמה" className={`${field} mt-5 text-center text-lg`} />
        {err && <p className="mt-2 text-sm font-medium text-rose-600">סיסמה שגויה</p>}
        <button className={`${primaryBtn} mt-3`}>כניסה</button>
      </form>
    </div>
  )

  const items = [
    { to: '/announcements', icon: 'Megaphone', title: 'פרסום הודעות', sub: 'כפתור "הודעה חדשה" במסך ההודעות' },
    { to: '/contacts', icon: 'Phone', title: 'עריכת מספרים חשובים', sub: 'הוספה, עריכה, מחיקה וכוכב' },
  ]
  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="ניהול" />
      <div className="flex items-center gap-3 rounded-3xl bg-emerald-50 p-4 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
        <Icon name="ShieldCheck" size={24} /><div className="font-bold">מצב ניהול פעיל במכשיר הזה</div>
      </div>
      <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="flex items-center gap-3 px-4 py-4 active:bg-slate-50 dark:active:bg-white/5">
            <Icon name={i.icon} size={22} className="text-navy-500 dark:text-accent-400" />
            <div className="flex-1"><div className="font-bold">{i.title}</div><div className="text-sm text-slate-500 dark:text-slate-400">{i.sub}</div></div>
            <Icon name="ChevronLeft" size={18} className="text-slate-400" />
          </Link>
        ))}
      </div>
      <p className="mt-4 px-1 text-sm text-slate-500 dark:text-slate-400">ניהול משתמשים, חדרים ושבטים יתווספו כאן בשלבים הבאים.</p>
      <button onClick={() => setAdmin(false)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 font-bold text-rose-600 shadow-card dark:bg-navy-900">
        <Icon name="Unlock" size={18} /> יציאה ממצב ניהול
      </button>
    </div>
  )
}
