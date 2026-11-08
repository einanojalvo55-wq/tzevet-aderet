import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'

// שלב 1: רק המסך של הסיסמה. הבדיקה האמיתית בשרת תגיע בשלב 2.
export default function Admin() {
  const nav = useNavigate()
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState('')
  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <header className="pt-safe flex items-center gap-2 py-4">
        <button onClick={() => nav(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card active:scale-95 dark:bg-navy-900" aria-label="חזרה">
          <Icon name="ArrowRight" size={20} />
        </button>
        <h1 className="text-2xl font-extrabold">ניהול</h1>
      </header>
      <form onSubmit={(e) => { e.preventDefault(); setMsg('בדיקת הסיסמה תחובר לשרת בשלב 2') }}
        className="mt-6 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-900">
        <div className="grid h-16 w-16 place-items-center rounded-3xl bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-white">
          <Icon name="Lock" size={28} />
        </div>
        <div className="mt-4 text-lg font-bold">אזור מוגן</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">הקלידו את סיסמת הניהול כדי להיכנס</p>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="סיסמה"
          className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-lg outline-none focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 dark:border-white/10 dark:bg-navy-950" />
        <button className="mt-3 w-full rounded-2xl bg-navy-700 py-3 font-bold text-white transition active:scale-[.98] dark:bg-accent-500 dark:text-navy-950">כניסה</button>
        {msg && <p className="mt-3 text-sm text-slate-500">{msg}</p>}
      </form>
    </div>
  )
}
