import { useState } from 'react'
import { doc, deleteDoc } from 'firebase/firestore'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Chips from '../components/Chips'
import { online, db, uid, updateUser } from '../firebase'
import Sheet, { primaryBtn } from '../components/Sheet'
import { useTeam, waNumber } from '../data/team'
import { useAdmin, useSettings, useGradeOf } from '../data/hooks'

export default function Team({ profile }) {
  const team = useTeam(profile)
  const [isAdmin] = useAdmin()
  const [{ tribes }] = useSettings()
  const gradeOf = useGradeOf()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const me = uid()
  const [editing, setEditing] = useState(null)

  const list = (team || [])
    .filter((u) => filter === 'all' || u.tribe === filter)
    .filter((u) => !q || `${u.firstName} ${u.lastName} ${u.phone}`.includes(q.trim()))
    .sort((a, b) => (tribes.indexOf(a.tribe) - tribes.indexOf(b.tribe)) || a.firstName.localeCompare(b.firstName, 'he'))

  const remove = async (u) => {
    if (!confirm(`להסיר את ${u.firstName} ${u.lastName} מהצוות?`)) return
    try { await deleteDoc(doc(db, 'users', u.id)) } catch { alert('ההסרה נכשלה') }
  }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="הצוות" />
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="חיפוש לפי שם או טלפון"
        className="mb-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-navy-500 dark:border-white/10 dark:bg-navy-900" />
      <Chips small options={[{ value: 'all', label: 'כולם' }, ...[...tribes, 'קומונרית'].map((t) => ({ value: t, label: gradeOf(t) ? `${t} · ${gradeOf(t).replace('כיתה ', '')}` : t }))]} value={filter} onChange={setFilter} />
      {!online && <p className="mt-3 px-1 text-sm text-slate-500">אחרי החיבור לשרת יופיעו כאן כל אנשי הצוות. כרגע מופיע רק הפרופיל שלך.</p>}
      {team === null ? <p className="mt-10 text-center text-slate-400">טוען...</p> : (
        <>
          <p className="mb-2 mt-4 px-1 text-sm font-bold text-slate-500">{list.length} אנשים</p>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
            {list.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy-500 to-navy-800 font-bold text-white">{u.firstName[0]}{u.lastName?.[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-bold">{u.firstName} {u.lastName}{u.id === me && <span className="font-normal text-slate-400"> (אני)</span>}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{u.tribe}{gradeOf(u.tribe) && ` · ${gradeOf(u.tribe)}`}</div>
                  {u.phone && <div className="text-xs text-slate-400" dir="ltr" style={{ textAlign: 'right' }}>{u.phone}</div>}
                </div>
                {u.phone && <>
                  <a href={`tel:${u.phone}`} className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-rose-700 active:scale-95 dark:bg-rose-500/15 dark:text-rose-300" aria-label="התקשרות"><Icon name="Phone" size={18} /></a>
                  <a href={`https://wa.me/${waNumber(u.phone)}`} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700 active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-300" aria-label="וואטסאפ"><Icon name="MessageCircle" size={18} /></a>
                </>}
                {isAdmin && online && <button onClick={() => setEditing(u)} className="text-slate-400 active:text-navy-600" aria-label="שינוי שבט"><Icon name="Pencil" size={18} /></button>}
                {isAdmin && online && u.id !== me && <button onClick={() => remove(u)} className="text-slate-300 active:text-rose-600" aria-label="הסרה"><Icon name="Trash2" size={18} /></button>}
              </div>
            ))}
          </div>
        </>
      )}
      {editing && <TribeEditor user={editing} tribes={tribes} onClose={() => setEditing(null)} />}
    </div>
  )
}

// רק למנהלים: לשנות לאיזה שבט מישהו מדריך
function TribeEditor({ user, tribes, onClose }) {
  const gradeOf = useGradeOf()
  const [tribe, setTribe] = useState(user.tribe)
  const [busy, setBusy] = useState(false)
  async function save() {
    setBusy(true)
    try { await updateUser(user.id, { tribe }); onClose() } catch { alert('השמירה נכשלה, נסו שוב'); setBusy(false) }
  }
  return (
    <Sheet title={`איזה שבט ${user.firstName} מדריך/ה?`} onClose={onClose}>
      <div className="space-y-4">
        <Chips cols={2} options={[...tribes, 'קומונרית'].map((t) => ({ value: t, label: t === 'קומונרית' ? '👑 קומונרית (מנהלת)' : gradeOf(t) ? `${t} · ${gradeOf(t)}` : t }))} value={tribe} onChange={setTribe} small />
        <button disabled={busy || tribe === user.tribe} onClick={save} className={primaryBtn}>{busy ? 'שומר...' : 'שמירה'}</button>
        <p className="text-center text-xs text-slate-400">השינוי יופיע גם בטלפון של {user.firstName}</p>
      </div>
    </Sheet>
  )
}
