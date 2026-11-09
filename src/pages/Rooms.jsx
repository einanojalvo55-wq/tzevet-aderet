import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import Fab from '../components/Fab'
import Chips from '../components/Chips'
import { Taken } from './Speaker'
import { useBookings, useSettings, useAdmin, fullName, notify } from '../data/hooks'
import { DAYS } from '../data/seed'
import { toMin, todayISO, parseISO } from '../data/dates'
import { newId } from '../data/store'

// שני סוגי שיבוצים:
// קבוע: { day: 0-6 } חוזר כל שבוע (המנהל קובע)
// חד-פעמי: { date: 'YYYY-MM-DD' } כל אחד יכול להזמין חדר פנוי
const dayOf = (iso) => parseISO(iso).getDay()
const isOn = (b, iso) => (b.date ? b.date === iso : b.day === dayOf(iso))

// שיבוץ קיים שמתנגש עם השיבוץ החדש (אותו חדר, אותו יום, שעות חופפות)
export function findClash(list, b) {
  return list.find((x) => {
    if (x.id === b.id || x.room !== b.room) return false
    if (toMin(b.from) >= toMin(x.to) || toMin(x.from) >= toMin(b.to)) return false
    if (b.date && x.date) return b.date === x.date
    if (b.date) return x.day === dayOf(b.date)
    if (x.date) return dayOf(x.date) === b.day
    return x.day === b.day
  })
}

// 14 הימים הקרובים לבחירה
function nextDays() {
  const out = []
  const d = parseISO(todayISO())
  for (let i = 0; i < 14; i++) {
    const x = new Date(d); x.setDate(d.getDate() + i)
    const iso = `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    out.push({ value: iso, label: i === 0 ? 'היום' : i === 1 ? 'מחר' : `${DAYS[x.getDay()]} ${x.getDate()}.${x.getMonth() + 1}` })
  }
  return out
}

export default function Rooms({ profile }) {
  const [list, setList] = useBookings()
  const [{ rooms, tribes }] = useSettings()
  const [isAdmin] = useAdmin()
  const days = nextDays()
  const [date, setDate] = useState(days[0].value)
  const [view, setView] = useState('days')
  const [roomFilter, setRoomFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const me = fullName(profile)
  const mine = list.filter((b) => b.by === me || b.who === profile.tribe || (b.who || '').split(/[-+ ]+/).includes(profile.tribe))
    .filter((b) => b.day != null || b.date >= todayISO())
    .sort((a, b) => (a.date || '9') .localeCompare(b.date || '9') || (a.day ?? 9) - (b.day ?? 9) || toMin(a.from) - toMin(b.from))
    .slice(0, 4)
  const isMine = (b) => b.by === me || b.who === profile.tribe || (b.who || '').split(/[-+ ]+/).includes(profile.tribe)
  const canEdit = (b) => isAdmin || (b.by && b.by === me)

  const save = (b) => {
    const isNew = !b.id
    const saved = isNew ? { ...b, id: newId() } : b
    setList((l) => isNew ? [...l, saved] : l.map((x) => x.id === b.id ? saved : x))
    const when = b.date ? days.find((d) => d.value === b.date)?.label || b.date : `כל יום ${DAYS[b.day]}`
    if (tribes.includes(b.who)) notify({ text: `שיבוץ חדר: ${b.who} ב${b.room}, ${when} \u200E${b.from}–${b.to}\u200E`, kind: 'room', to: `tribe:${b.who}`, link: '/rooms' })
    setEditing(null)
  }
  const remove = (b) => { if (confirm('לבטל את ההזמנה?')) { setList((l) => l.filter((x) => x.id !== b.id)); setEditing(null) } }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="חדרים" />

      <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white shadow-lg">
        <div className="text-sm font-semibold text-white/80">השיבוצים שלי ושל {profile.tribe}</div>
        {mine.length === 0 ? <div className="mt-1 text-lg font-extrabold">אין שיבוצים. אפשר להזמין חדר פנוי 👇</div> : mine.map((b) => (
          <div key={b.id} className="mt-1 flex items-center gap-2 font-bold"><Icon name="DoorOpen" size={18} />{b.room} · {b.date ? days.find((d) => d.value === b.date)?.label || b.date : `כל יום ${DAYS[b.day]}`} <span dir="ltr">{b.from}–{b.to}</span></div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/70 p-1 dark:bg-white/5">
        {[['days', 'לפי ימים', 'List'], ['rooms', 'לפי חדר', 'DoorOpen']].map(([v, l, i]) => (
          <button key={v} onClick={() => setView(v)} className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-bold transition ${view === v ? 'bg-white shadow dark:bg-navy-800' : 'text-slate-500'}`}>
            <Icon name={i} size={16} /> {l}
          </button>
        ))}
      </div>

      {view === 'days' ? (
        <DaysView list={list} rooms={rooms} days={days} roomFilter={roomFilter} setRoomFilter={setRoomFilter} profile={profile} me={me} canEdit={canEdit} onOpen={setEditing} onBook={(iso) => setEditing({ date: iso, room: roomFilter !== 'all' ? roomFilter : rooms[0] })} />
      ) : (
        <>
      <div className="-mx-4 mt-5 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          {days.map((d) => (
            <button key={d.value} onClick={() => setDate(d.value)} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold transition ${date === d.value ? 'bg-navy-700 text-white dark:bg-accent-500 dark:text-navy-950' : 'bg-white shadow-card dark:bg-navy-900'}`}>{d.label}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {rooms.map((room) => {
          const items = list.filter((b) => b.room === room && isOn(b, date)).sort((a, b) => toMin(a.from) - toMin(b.from))
          return (
            <div key={room} className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
              <div className="mb-2 flex items-center gap-2">
                <Icon name="DoorOpen" size={18} className="text-teal-600 dark:text-teal-300" />
                <span className="flex-1 font-extrabold">{room}</span>
                <button onClick={() => setEditing({ room, date })} className="rounded-xl bg-teal-50 px-3 py-1.5 text-sm font-bold text-teal-700 active:scale-95 dark:bg-teal-500/15 dark:text-teal-300">+ הזמנה</button>
              </div>
              {items.length === 0 ? <div className="text-sm font-semibold text-emerald-600">✓ פנוי כל היום</div> : (
                <div className="space-y-1.5">
                  {items.map((b) => (
                    <button key={b.id} disabled={!canEdit(b)} onClick={() => setEditing(b)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-right text-sm ${isMine(b) ? 'bg-teal-500 font-bold text-white' : 'bg-slate-50 dark:bg-white/5'}`}>
                      <span className="min-w-0 flex-1">{b.who}{b.note && <span className="font-normal opacity-80"> · {b.note}</span>}{b.day != null && <span className="opacity-70"> · קבוע</span>}</span>
                      {b.phone && <a href={`tel:${b.phone}`} onClick={(e) => e.stopPropagation()} className="opacity-80" dir="ltr">{b.phone}</a>}
                      <span dir="ltr">{b.from}–{b.to}</span>
                      {canEdit(b) && <Icon name="Pencil" size={14} className="opacity-60" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

        </>
      )}

      <Fab label="הזמנת חדר" onClick={() => setEditing({ date })} />
      {editing && <BookingForm initial={editing} list={list} rooms={rooms} tribes={tribes} days={days} profile={profile} isAdmin={isAdmin}
        onClose={() => setEditing(null)} onSave={save} onDelete={editing.id ? () => remove(editing) : null} />}
    </div>
  )
}

function BookingForm({ initial, list, rooms, tribes, days, profile, isAdmin, onClose, onSave, onDelete }) {
  const me = fullName(profile)
  const [b, setB] = useState({ room: rooms[0], from: '16:00', to: '17:30', who: profile.tribe, by: me, phone: profile.phone || '', ...initial })
  const weekly = b.day != null
  const clash = findClash(list, b)
  const badTime = toMin(b.to) <= toMin(b.from)
  const setWeekly = (on) => setB(on ? { ...b, day: b.date ? dayOf(b.date) : 6, date: undefined } : { ...b, day: undefined, date: days[0].value })
  const whoOptions = [...new Set([profile.tribe, me, ...tribes])]

  return (
    <Sheet title={initial.id ? 'עריכת הזמנה' : 'הזמנת חדר'} onClose={onClose}>
      <div className="space-y-4">
        <div><div className="mb-1.5 text-sm font-semibold">איזה חדר</div><Chips options={rooms} value={b.room} onChange={(room) => setB({ ...b, room })} small /></div>
        {isAdmin && <Chips cols={2} small options={[{ value: false, label: 'פעם אחת' }, { value: true, label: 'קבוע כל שבוע' }]} value={weekly} onChange={setWeekly} />}
        {weekly ? (
          <div><div className="mb-1.5 text-sm font-semibold">איזה יום בשבוע</div><Chips options={DAYS.map((d, i) => ({ value: i, label: d }))} value={b.day} onChange={(day) => setB({ ...b, day })} small /></div>
        ) : (
          <div><div className="mb-1.5 text-sm font-semibold">מתי</div>
            <select className={field} value={b.date} onChange={(e) => setB({ ...b, date: e.target.value })}>
              {days.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <label><span className="mb-1 block text-sm font-semibold">משעה</span><input type="time" className={field} value={b.from} onChange={(e) => setB({ ...b, from: e.target.value })} /></label>
          <label><span className="mb-1 block text-sm font-semibold">עד שעה</span><input type="time" className={field} value={b.to} onChange={(e) => setB({ ...b, to: e.target.value })} /></label>
        </div>
        <div><div className="mb-1.5 text-sm font-semibold">בשביל מי</div><Chips options={isAdmin ? whoOptions : [profile.tribe, me]} value={b.who} onChange={(who) => setB({ ...b, who })} small /></div>
        {clash && <Taken what="החדר תפוס בשעה הזאת" who={`${clash.who}${clash.by && clash.by !== clash.who ? ` (${clash.by})` : ''}`} phone={clash.phone} />}
        {clash && <p className="-mt-2 text-sm text-slate-500">{clash.room}: <span dir="ltr">{clash.from}–{clash.to}</span>{clash.day != null ? ` · קבוע כל יום ${DAYS[clash.day]}` : ''}</p>}
        {badTime && <p className="text-sm text-rose-600">שעת הסיום צריכה להיות אחרי שעת ההתחלה</p>}
        <button disabled={!!clash || badTime} onClick={() => onSave(b)} className={primaryBtn}>{clash ? 'החדר תפוס' : 'שמירה'}</button>
        {onDelete && <button onClick={onDelete} className="w-full py-2 font-semibold text-rose-600">ביטול ההזמנה</button>}
      </div>
    </Sheet>
  )
}

// הערה בלי "חודש ארגון" (מופיע פעם אחת למעלה)
const cleanNote = (n) => (n || '').split(' · ').filter((x) => x !== 'חודש ארגון').join(' · ')

// תצוגה מסודרת לפי ימים: כל יום כרטיס, ובתוכו השעות לפי הסדר
function DaysView({ list, rooms, days, roomFilter, setRoomFilter, profile, me, canEdit, onOpen, onBook }) {
  const today = days[0].value
  const shown = list.filter((b) => roomFilter === 'all' || b.room === roomFilter)
  // עד התאריך האחרון שיש בו שיבוץ (לפחות שבוע קדימה)
  const lastBooked = shown.filter((b) => b.date && b.date >= today).map((b) => b.date).sort().pop()
  const until = [days[6].value, lastBooked].filter(Boolean).sort().pop()
  const range = days.filter((d) => d.value <= until)
  const orgMonth = shown.filter((b) => b.date >= today && (b.note || '').includes('חודש ארגון')).map((b) => b.date).sort().pop()

  return (
    <div className="mt-4">
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          {[{ value: 'all', label: 'כל החדרים' }, ...rooms.map((r) => ({ value: r, label: r }))].map((o) => (
            <button key={o.value} onClick={() => setRoomFilter(o.value)} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold transition ${roomFilter === o.value ? 'bg-teal-600 text-white' : 'bg-white shadow-card dark:bg-navy-900'}`}>{o.label}</button>
          ))}
        </div>
      </div>

      {orgMonth && (
        <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          📌 לוח שיבוצים של חודש ארגון, עד {parseISO(orgMonth).getDate()}.{parseISO(orgMonth).getMonth() + 1}. אחרי זה כל אחד מזמין בעצמו.
        </div>
      )}

      <div className="mt-3 space-y-3">
        {range.map((d) => {
          const items = shown.filter((b) => isOn(b, d.value)).sort((a, b) => toMin(a.from) - toMin(b.from) || a.room.localeCompare(b.room))
          const dt = parseISO(d.value)
          return (
            <section key={d.value} className="overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-900">
              <div className={`flex items-center gap-2 px-4 py-2.5 ${d.value === today ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-white/5'}`}>
                <span className="font-extrabold">יום {DAYS[dt.getDay()]}</span>
                <span className={d.value === today ? 'text-white/85' : 'text-slate-500'}>{dt.getDate()}.{dt.getMonth() + 1}</span>
                {d.value === today && <span className="rounded-full bg-white/25 px-2 text-xs font-bold">היום</span>}
                <button onClick={() => onBook(d.value)} className={`mr-auto rounded-xl px-2.5 py-1 text-xs font-bold ${d.value === today ? 'bg-white/20' : 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'}`}>+ הזמנה</button>
              </div>
              {items.length === 0 ? (
                <div className="px-4 py-2.5 text-sm font-semibold text-emerald-600">✓ הכול פנוי</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {items.map((b) => {
                    const note = cleanNote(b.note)
                    const mine = b.by === me || b.who === profile.tribe || (b.who || '').split(/[-+ ]+/).includes(profile.tribe)
                    return (
                      <button key={b.id} disabled={!canEdit(b)} onClick={() => onOpen(b)} className={`flex w-full items-start gap-3 px-4 py-2.5 text-right ${mine ? 'bg-teal-50 dark:bg-teal-500/10' : ''}`}>
                        <span className="w-[92px] shrink-0 pt-0.5 text-sm font-extrabold tabular-nums text-navy-700 dark:text-accent-400" dir="ltr" style={{ textAlign: 'right' }}>{b.from}–{b.to}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{b.who}</span>
                          {(note || roomFilter === 'all') && <span className="block text-xs text-slate-500 dark:text-slate-400">{[roomFilter === 'all' ? b.room : null, note || null].filter(Boolean).join(' · ')}</span>}
                          {b.phone && <a href={`tel:${b.phone}`} onClick={(e) => e.stopPropagation()} className="text-xs font-semibold text-navy-600 dark:text-accent-400" dir="ltr">{b.phone}</a>}
                        </span>
                        {canEdit(b) && <Icon name="Pencil" size={14} className="mt-1 text-slate-400" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
