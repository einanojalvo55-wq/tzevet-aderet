import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import Fab from '../components/Fab'
import Chips from '../components/Chips'
import { useBookings, useSettings, useAdmin, notify } from '../data/hooks'
import { DAYS } from '../data/seed'
import { toMin } from '../data/dates'
import { newId } from '../data/store'

// בודק אם שיבוץ חדש מתנגש עם שיבוץ קיים באותו חדר, יום ושעה
export function findClash(list, b) {
  return list.find((x) => x.id !== b.id && x.room === b.room && x.day === b.day && toMin(b.from) < toMin(x.to) && toMin(x.from) < toMin(b.to))
}

export default function Rooms({ profile }) {
  const [list, setList] = useBookings()
  const [{ rooms, tribes }] = useSettings()
  const [isAdmin] = useAdmin()
  const [day, setDay] = useState(new Date().getDay())
  const [editing, setEditing] = useState(null)
  const mine = list.filter((b) => b.who === profile.tribe).sort((a, b) => a.day - b.day || toMin(a.from) - toMin(b.from))

  const save = (b) => {
    const isNew = !b.id
    const saved = isNew ? { ...b, id: newId() } : b
    setList((l) => isNew ? [...l, saved] : l.map((x) => x.id === b.id ? saved : x))
    notify({ text: `שיבוץ חדר: ${b.who} ב${b.room}, יום ${DAYS[b.day]} ${b.from}–${b.to}`, kind: 'room', to: `tribe:${b.who}`, link: '/rooms' })
    setEditing(null)
  }
  const remove = (b) => { if (confirm('למחוק את השיבוץ?')) { setList((l) => l.filter((x) => x.id !== b.id)); setEditing(null) } }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="שיבוץ חדרים" />

      <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white shadow-lg">
        <div className="text-sm font-semibold text-white/80">איפה {profile.tribe} השבוע</div>
        {mine.length === 0 ? <div className="mt-1 text-xl font-extrabold">עוד לא שובצתם לחדר</div> : mine.map((b) => (
          <div key={b.id} className="mt-1 flex items-center gap-2 text-lg font-bold"><Icon name="DoorOpen" size={20} />{b.room} · יום {DAYS[b.day]} {b.from}–{b.to}</div>
        ))}
      </div>

      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          {DAYS.map((d, i) => (
            <button key={d} onClick={() => setDay(i)} className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${day === i ? 'bg-navy-700 text-white dark:bg-accent-500 dark:text-navy-950' : 'bg-white shadow-card dark:bg-navy-900'}`}>{d}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rooms.map((room) => {
          const items = list.filter((b) => b.room === room && b.day === day).sort((a, b) => toMin(a.from) - toMin(b.from))
          return (
            <div key={room} className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
              <div className="mb-2 flex items-center gap-2 font-extrabold"><Icon name="DoorOpen" size={18} className="text-teal-600 dark:text-teal-300" />{room}</div>
              {items.length === 0 ? <div className="text-sm text-slate-400">פנוי כל היום</div> : (
                <div className="space-y-1.5">
                  {items.map((b) => (
                    <button key={b.id} disabled={!isAdmin} onClick={() => setEditing(b)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm ${b.who === profile.tribe ? 'bg-teal-500 font-bold text-white' : 'bg-slate-50 dark:bg-white/5'}`}>
                      <span className="flex-1">{b.who}</span><span dir="ltr">{b.from}–{b.to}</span>
                      {isAdmin && <Icon name="Pencil" size={14} className="opacity-60" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {isAdmin && <Fab label="שיבוץ חדש" onClick={() => setEditing({ day })} />}
      {editing && <BookingForm initial={editing} list={list} rooms={rooms} tribes={tribes} onClose={() => setEditing(null)} onSave={save} onDelete={editing.id ? () => remove(editing) : null} />}
    </div>
  )
}

function BookingForm({ initial, list, rooms, tribes, onClose, onSave, onDelete }) {
  const [b, setB] = useState({ room: rooms[0], day: 6, from: '16:00', to: '17:30', who: tribes[0], ...initial })
  const clash = findClash(list, b)
  const badTime = toMin(b.to) <= toMin(b.from)
  return (
    <Sheet title={initial.id ? 'עריכת שיבוץ' : 'שיבוץ חדש'} onClose={onClose}>
      <div className="space-y-4">
        <div><div className="mb-1.5 text-sm font-semibold">מי</div><Chips options={tribes} value={b.who} onChange={(who) => setB({ ...b, who })} small /></div>
        <div><div className="mb-1.5 text-sm font-semibold">איזה חדר</div><Chips options={rooms} value={b.room} onChange={(room) => setB({ ...b, room })} small /></div>
        <div><div className="mb-1.5 text-sm font-semibold">יום</div><Chips options={DAYS.map((d, i) => ({ value: i, label: d }))} value={b.day} onChange={(day) => setB({ ...b, day })} small /></div>
        <div className="grid grid-cols-2 gap-2">
          <label><span className="mb-1 block text-sm font-semibold">משעה</span><input type="time" className={field} value={b.from} onChange={(e) => setB({ ...b, from: e.target.value })} /></label>
          <label><span className="mb-1 block text-sm font-semibold">עד שעה</span><input type="time" className={field} value={b.to} onChange={(e) => setB({ ...b, to: e.target.value })} /></label>
        </div>
        {clash && <div className="flex items-start gap-2 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"><Icon name="AlertTriangle" size={18} className="shrink-0" />התנגשות: {clash.who} כבר ב{clash.room} ביום {DAYS[clash.day]} {clash.from}–{clash.to}</div>}
        {badTime && <p className="text-sm text-rose-600">שעת הסיום צריכה להיות אחרי שעת ההתחלה</p>}
        <button disabled={!!clash || badTime} onClick={() => onSave(b)} className={primaryBtn}>שמירה</button>
        {onDelete && <button onClick={onDelete} className="w-full py-2 font-semibold text-rose-600">מחיקת השיבוץ</button>}
      </div>
    </Sheet>
  )
}
