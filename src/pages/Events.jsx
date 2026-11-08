import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import Fab from '../components/Fab'
import Chips from '../components/Chips'
import { tone } from '../components/colors'
import { useEvents, useAdmin, fullName, notify } from '../data/hooks'
import { EVENT_TYPES } from '../data/seed'
import { todayISO, fmtDate, relDay, parseISO, eventTime } from '../data/dates'
import { newId } from '../data/store'

const HE_DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

export default function Events({ profile }) {
  const [events, setEvents] = useEvents()
  const [isAdmin] = useAdmin()
  const [view, setView] = useState('list')
  const [open, setOpen] = useState(null)       // אירוע פתוח
  const [editing, setEditing] = useState(null) // טופס
  const me = fullName(profile)
  const today = todayISO()
  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => eventTime(a) - eventTime(b))
  const past = events.filter((e) => e.date < today).sort((a, b) => eventTime(b) - eventTime(a))

  const rsvp = (e, val) => setEvents((l) => l.map((x) => x.id === e.id ? { ...x, rsvp: { ...x.rsvp, [me]: val } } : x))
  const save = (e) => {
    const isNew = !e.id
    const saved = isNew ? { ...e, id: newId(), rsvp: {} } : e
    setEvents((l) => isNew ? [...l, saved] : l.map((x) => x.id === e.id ? saved : x))
    notify({ text: `${isNew ? 'אירוע חדש' : 'עדכון באירוע'}: ${e.title}, ${relDay(e.date)}${e.time ? ` ב-${e.time}` : ''}`, kind: 'event', link: '/events' })
    setEditing(null); setOpen(null)
  }
  const remove = (e) => { if (confirm('למחוק את האירוע?')) { setEvents((l) => l.filter((x) => x.id !== e.id)); setOpen(null) } }
  const current = open && events.find((x) => x.id === open)

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="אירועים" back={false} />
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1 dark:bg-white/5">
        {[['list', 'רשימה', 'List'], ['month', 'לוח חודשי', 'Calendar']].map(([v, l, i]) => (
          <button key={v} onClick={() => setView(v)} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition ${view === v ? 'bg-white shadow dark:bg-navy-800' : 'text-slate-500'}`}>
            <Icon name={i} size={16} /> {l}
          </button>
        ))}
      </div>

      {view === 'list' ? (
        <>
          {upcoming.length === 0 && <p className="mt-10 text-center text-slate-500">אין אירועים קרובים</p>}
          <div className="space-y-3">{upcoming.map((e) => <EventCard key={e.id} e={e} me={me} onOpen={() => setOpen(e.id)} onRsvp={rsvp} />)}</div>
          {past.length > 0 && (
            <>
              <h2 className="mb-2 mt-6 px-1 text-sm font-bold text-slate-500">אירועים שעברו</h2>
              <div className="space-y-3 opacity-60">{past.slice(0, 5).map((e) => <EventCard key={e.id} e={e} me={me} onOpen={() => setOpen(e.id)} />)}</div>
            </>
          )}
        </>
      ) : (
        <MonthView events={events} onOpen={(e) => setOpen(e.id)} />
      )}

      {isAdmin && <Fab label="אירוע חדש" onClick={() => setEditing({})} />}
      {current && !editing && <EventDetails e={current} me={me} isAdmin={isAdmin} onClose={() => setOpen(null)} onRsvp={rsvp} onEdit={() => setEditing(current)} onDelete={() => remove(current)} />}
      {editing && <EventForm initial={editing} onClose={() => setEditing(null)} onSave={save} />}
    </div>
  )
}

function counts(e) {
  const v = Object.values(e.rsvp || {})
  return { yes: v.filter((x) => x === 'yes').length, no: v.filter((x) => x === 'no').length }
}

function EventCard({ e, me, onOpen, onRsvp }) {
  const t = EVENT_TYPES[e.type] || EVENT_TYPES['פעולה']
  const mine = e.rsvp?.[me]
  return (
    <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
      <button onClick={onOpen} className="flex w-full items-start gap-3 text-right">
        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl ${tone[t.color]}`}>
          <span className="text-xl font-extrabold leading-none">{parseISO(e.date).getDate()}</span>
          <span className="text-[11px] font-semibold">{parseISO(e.date).toLocaleDateString('he-IL', { month: 'short' })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-slate-400">{e.type} · {relDay(e.date)}</div>
          <div className="truncate text-[17px] font-bold">{e.title}</div>
          <div className="mt-0.5 flex flex-wrap gap-x-3 text-sm text-slate-500 dark:text-slate-400">
            {e.time && <span className="flex items-center gap-1"><Icon name="Clock" size={14} />{e.time}</span>}
            {e.place && <span className="flex items-center gap-1"><Icon name="MapPin" size={14} />{e.place}</span>}
          </div>
        </div>
      </button>
      {onRsvp && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={() => onRsvp(e, 'yes')} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition active:scale-95 ${mine === 'yes' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5'}`}><Icon name="Check" size={16} />מגיע</button>
          <button onClick={() => onRsvp(e, 'no')} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition active:scale-95 ${mine === 'no' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/5'}`}><Icon name="X" size={16} />לא מגיע</button>
        </div>
      )}
    </div>
  )
}

function MonthView({ events, onOpen }) {
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [sel, setSel] = useState(todayISO())
  const y = cursor.getFullYear(), m = cursor.getMonth()
  const days = new Date(y, m + 1, 0).getDate()
  const lead = cursor.getDay()
  const iso = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const byDay = (d) => events.filter((e) => e.date === iso(d))
  const today = todayISO()
  const selected = events.filter((e) => e.date === sel).sort((a, b) => eventTime(a) - eventTime(b))

  return (
    <div>
      <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
        <div className="mb-3 flex items-center">
          <button onClick={() => setCursor(new Date(y, m - 1, 1))} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-white/10" aria-label="חודש קודם"><Icon name="ChevronRight" size={18} /></button>
          <div className="flex-1 text-center text-lg font-extrabold">{cursor.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}</div>
          <button onClick={() => setCursor(new Date(y, m + 1, 1))} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-white/10" aria-label="חודש הבא"><Icon name="ChevronLeft" size={18} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {HE_DAYS.map((d) => <div key={d} className="pb-1 text-xs font-bold text-slate-400">{d}</div>)}
          {Array.from({ length: lead }).map((_, i) => <div key={'x' + i} />)}
          {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
            const evs = byDay(d), isSel = iso(d) === sel, isToday = iso(d) === today
            return (
              <button key={d} onClick={() => setSel(iso(d))} className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold transition ${isSel ? 'bg-navy-700 text-white dark:bg-accent-500 dark:text-navy-950' : isToday ? 'bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-white' : ''}`}>
                {d}
                <span className="mt-0.5 flex h-1.5 gap-0.5">{evs.slice(0, 3).map((e) => <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${isSel ? 'bg-white' : (EVENT_TYPES[e.type]?.dot || 'bg-slate-400')}`} />)}</span>
              </button>
            )
          })}
        </div>
      </div>
      <h2 className="mb-2 mt-5 px-1 text-sm font-bold text-slate-500">{fmtDate(sel)}</h2>
      {selected.length === 0 ? <p className="px-1 text-sm text-slate-400">אין אירועים ביום הזה</p> : (
        <div className="space-y-2">
          {selected.map((e) => (
            <button key={e.id} onClick={() => onOpen(e)} className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-right shadow-card dark:bg-navy-900">
              <span className={`h-10 w-1.5 rounded-full ${EVENT_TYPES[e.type]?.dot}`} />
              <div className="flex-1"><div className="font-bold">{e.title}</div><div className="text-sm text-slate-500">{e.time} {e.place && `· ${e.place}`}</div></div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EventDetails({ e, me, isAdmin, onClose, onRsvp, onEdit, onDelete }) {
  const c = counts(e)
  const entries = Object.entries(e.rsvp || {})
  return (
    <Sheet title={e.title} onClose={onClose}>
      <div className="space-y-2 text-[15px]">
        <div className="flex items-center gap-2"><Icon name="CalendarDays" size={18} className="text-slate-400" />{fmtDate(e.date)}{e.time && ` · ${e.time}`}</div>
        {e.place && <div className="flex items-center gap-2"><Icon name="MapPin" size={18} className="text-slate-400" />{e.place}</div>}
        {e.owner && <div className="flex items-center gap-2"><Icon name="User" size={18} className="text-slate-400" />אחראי: {e.owner}</div>}
        <div><span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${tone[EVENT_TYPES[e.type]?.color || 'slate']}`}>{e.type}</span></div>
        {e.desc && <p className="whitespace-pre-line pt-1 text-slate-600 dark:text-slate-300">{e.desc}</p>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => onRsvp(e, 'yes')} className={`rounded-2xl py-3 font-bold ${e.rsvp?.[me] === 'yes' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-white/5'}`}>מגיע ✓</button>
        <button onClick={() => onRsvp(e, 'no')} className={`rounded-2xl py-3 font-bold ${e.rsvp?.[me] === 'no' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-white/5'}`}>לא מגיע</button>
      </div>
      {isAdmin && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-3 dark:bg-navy-950">
          <div className="mb-1 text-sm font-bold">אישורי הגעה: {c.yes} מגיעים · {c.no} לא מגיעים</div>
          {entries.length === 0 ? <div className="text-sm text-slate-400">עוד אף אחד לא ענה</div> :
            entries.map(([n, v]) => <div key={n} className="flex justify-between text-sm"><span>{n}</span><span className={v === 'yes' ? 'text-emerald-600' : 'text-rose-600'}>{v === 'yes' ? 'מגיע' : 'לא מגיע'}</span></div>)}
        </div>
      )}
      {isAdmin && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button onClick={onEdit} className="flex items-center justify-center gap-1.5 rounded-2xl bg-navy-700 py-3 font-bold text-white"><Icon name="Pencil" size={16} />עריכה</button>
          <button onClick={onDelete} className="flex items-center justify-center gap-1.5 rounded-2xl bg-rose-50 py-3 font-bold text-rose-600 dark:bg-rose-500/10"><Icon name="Trash2" size={16} />מחיקה</button>
        </div>
      )}
    </Sheet>
  )
}

function EventForm({ initial, onClose, onSave }) {
  const [e, setE] = useState({ title: '', date: todayISO(), time: '', place: '', type: 'פעולה', owner: '', desc: '', ...initial })
  const set = (k) => (ev) => setE({ ...e, [k]: ev.target.value })
  return (
    <Sheet title={initial.id ? 'עריכת אירוע' : 'אירוע חדש'} onClose={onClose}>
      <div className="space-y-3">
        <input className={field} value={e.title} onChange={set('title')} placeholder="שם האירוע" />
        <div className="grid grid-cols-2 gap-2">
          <input type="date" className={field} value={e.date} onChange={set('date')} />
          <input type="time" className={field} value={e.time} onChange={set('time')} />
        </div>
        <input className={field} value={e.place} onChange={set('place')} placeholder="מקום" />
        <input className={field} value={e.owner} onChange={set('owner')} placeholder="אחראי (לא חובה)" />
        <Chips options={Object.keys(EVENT_TYPES)} value={e.type} onChange={(type) => setE({ ...e, type })} small />
        <textarea className={`${field} min-h-24`} value={e.desc} onChange={set('desc')} placeholder="תיאור (לא חובה)" />
        <button disabled={!e.title.trim() || !e.date} onClick={() => onSave({ ...e, title: e.title.trim() })} className={primaryBtn}>שמירה ושליחת התראה</button>
      </div>
    </Sheet>
  )
}
