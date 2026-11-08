import { useState } from 'react'
import Icon from '../components/Icon'
import Onboarding from './Onboarding'
import { useAdmin } from '../data/hooks'

const roleName = { owner: 'מנהל ראשי', admin: 'מנהל', member: 'מדריך' }

export default function Profile({ profile, onSave, onReset }) {
  const [editing, setEditing] = useState(false)
  const [isAdmin] = useAdmin()
  if (editing) return <Onboarding initial={profile} onDone={(p) => { onSave(p); setEditing(false) }} onCancel={() => setEditing(false)} />

  const initials = profile.firstName[0] + (profile.lastName[0] || '')
  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <header className="pt-safe py-4"><h1 className="text-2xl font-extrabold">פרופיל</h1></header>
      <div className="flex flex-col items-center rounded-3xl bg-white p-6 text-center shadow-card dark:bg-navy-900">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-navy-800 text-2xl font-extrabold text-white">{initials}</div>
        <div className="mt-3 text-xl font-extrabold">{profile.firstName} {profile.lastName}</div>
        <div className="mt-1 flex gap-2 text-sm">
          <span className="rounded-full bg-navy-100 px-3 py-1 font-semibold text-navy-700 dark:bg-white/10 dark:text-white">{isAdmin ? 'מנהל' : roleName[profile.role]}</span>
          <span className="rounded-full bg-accent-500/15 px-3 py-1 font-semibold text-accent-600 dark:text-accent-400">{profile.tribe}</span>
        </div>
      </div>
      <div className="mt-4 overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-900">
        <button onClick={() => setEditing(true)} className="flex w-full items-center gap-3 px-5 py-4 text-right font-semibold active:bg-slate-50 dark:active:bg-white/5">
          <Icon name="User" size={20} className="text-navy-500" /> <span className="flex-1">עריכת פרטים</span> <Icon name="ChevronLeft" size={18} className="text-slate-400" />
        </button>
        <div className="h-px bg-slate-100 dark:bg-white/5" />
        <button onClick={() => { if (confirm('לצאת מהפרופיל במכשיר הזה?')) onReset() }} className="flex w-full items-center gap-3 px-5 py-4 text-right font-semibold text-rose-600 active:bg-slate-50 dark:active:bg-white/5">
          <Icon name="LogOut" size={20} /> <span className="flex-1">יציאה</span>
        </button>
      </div>
    </div>
  )
}
