import { useState } from 'react'
import Logo from '../components/Logo'
import { useSettings, useGradeOf } from '../data/hooks'
import { ADMIN_PASSWORD, KOMUNARIT } from '../data/seed'

const field = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-[17px] outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 dark:border-white/10 dark:bg-navy-950'

export default function Onboarding({ initial, onDone, onCancel, lockTribe }) {
  const [firstName, setFirst] = useState(initial?.firstName || '')
  const [lastName, setLast] = useState(initial?.lastName || '')
  const [tribe, setTribe] = useState(initial?.tribe || '')
  const [phone, setPhone] = useState(initial?.phone || '')
  const [tried, setTried] = useState(false)
  const [pw, setPw] = useState('')
  const [{ tribes: TRIBES }] = useSettings()
  const gradeOf = useGradeOf()
  const phoneOk = phone.replace(/\D/g, '').length >= 9
  const isKom = tribe === KOMUNARIT
  // קומונרית צריכה סיסמה (אלא אם כבר רשומה כקומונרית ורק עורכת פרטים)
  const pwOk = !isKom || initial?.tribe === KOMUNARIT || pw.trim() === ADMIN_PASSWORD
  const ok = firstName.trim() && lastName.trim() && tribe && phoneOk && pwOk

  function submit(e) {
    e.preventDefault()
    setTried(true)
    if (!ok) return
    onDone({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim(), tribe, role: isKom ? 'admin' : (initial?.role === 'admin' ? 'admin' : 'member'), createdAt: initial?.createdAt || Date.now() })
  }

  return (
    <div className="page-in pt-safe mx-auto flex min-h-full max-w-md flex-col px-5 pb-10">
      <div className="flex flex-col items-center pt-12 text-center">
        <Logo className="h-28 w-28 rounded-[28px] shadow-xl" />
        <h1 className="mt-5 text-3xl font-extrabold">{initial?.phone ? 'עריכת פרופיל' : 'ברוכים הבאים לצוות אדרת'}</h1>
        {!initial?.phone && <p className="mt-2 text-slate-500 dark:text-slate-400">רק כמה פרטים ונכנסים</p>}
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl bg-white p-5 shadow-card dark:bg-navy-900">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">שם פרטי</span>
          <input className={field} value={firstName} onChange={(e) => setFirst(e.target.value)} autoComplete="given-name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">שם משפחה</span>
          <input className={field} value={lastName} onChange={(e) => setLast(e.target.value)} autoComplete="family-name" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">מספר טלפון</span>
          <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" dir="ltr" style={{ textAlign: 'right' }} />
        </label>
        <div>
          <span className="mb-1.5 block text-sm font-semibold">איזה שבט אתה מדריך?</span>
          {lockTribe ? (
            <div className="rounded-2xl bg-slate-100 px-4 py-3 font-semibold dark:bg-white/5">{tribe} {gradeOf(tribe) && `(${gradeOf(tribe)})`} <span className="text-xs font-normal text-slate-500">· רק מנהל יכול לשנות</span></div>
          ) : (
          <div className="grid grid-cols-3 gap-2">
            {[...TRIBES, KOMUNARIT].map((t) => (
              <button type="button" key={t} onClick={() => setTribe(t)}
                className={`rounded-2xl py-3 text-[15px] font-semibold transition active:scale-95 ${tribe === t ? 'bg-navy-700 text-white shadow-md dark:bg-accent-500 dark:text-navy-950' : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300'}`}>
                {t}{gradeOf(t) && <span className="block text-[11px] font-normal opacity-75">{gradeOf(t)}</span>}
              </button>
            ))}
          </div>
          )}
        </div>
        {isKom && initial?.tribe !== KOMUNARIT && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">סיסמת קומונרית</span>
            <input className={`${field} text-center`} type="password" inputMode="numeric" value={pw} onChange={(e) => setPw(e.target.value)} />
            {pw && !pwOk && <span className="mt-1 block text-sm font-medium text-rose-600">סיסמה שגויה</span>}
          </label>
        )}
        {tried && !ok && <p className="text-sm font-medium text-rose-600">{isKom && !pwOk ? 'צריך סיסמה נכונה כדי להירשם כקומונרית' : 'צריך למלא שם פרטי, שם משפחה, מספר טלפון תקין ולבחור שבט'}</p>}
        <button className="w-full rounded-2xl bg-accent-500 py-4 text-lg font-bold text-white shadow-md transition active:scale-[.98]">
          {initial?.phone ? 'שמירה' : 'יצירת פרופיל'}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="w-full py-2 text-sm font-semibold text-slate-500">ביטול</button>}
      </form>
    </div>
  )
}
