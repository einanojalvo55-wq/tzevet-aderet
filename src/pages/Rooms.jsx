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
const toISO = (x) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
const dm = (iso) => { const d = parseISO(iso); return `${d.getDate()}.${d.getMonth() + 1}` }

// "היום" / "מחר" / "יום שני 16.11"
export function dayLabel(iso) {
  const diff = Math.round((parseISO(iso) - parseISO(todayISO())) / 86400000)
  if (diff === 0) return 'היום'
  if (diff === 1) return 'מחר'
  return `יום ${DAYS[dayOf(iso)]} ${dm(iso)}`
}

// שבעת ימי השבוע (ראשון עד שבת). offset 0 = השבוע, 1 = שבוע הבא...
function weekDays(offset) {
  const start = parseISO(todayISO())
  start.setDate(start.getDate() - start.getDay() + offset * 7)
  return Array.from({ length: 7 }, (_, i) => { const x = new Date(start); x.setDate(start.getDate() + i); return toISO(x) })
}

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

export default function Rooms({ profile }) {
  const [list, setList] = useBookings()
  const [{ rooms, tribes }] = useSettings()
  const [isAdmin] = useAdmin()
  const [week, setWeek] = useState(0)
  const days = weekDays(week)
  const today = todayISO()
  const [roomFilter, setRoomFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const me = fullName(profile)
  const isMine = (b) => b.by === me || b.who === profile.tribe || (b.who || '').split(/[-+ ]+/).includes(profile.tribe)
  const canEdit = (b) => isAdmin || (b.by && b.by === me)
  const mine = list.filter(isMine).filter((b) => b.day != null || b.date >= today)
    .sort((a, b) => (a.date || '9').localeCompare(b.date || '9') || (a.day ?? 9) - (b.day ?? 9) || toMin(a.from) - toMin(b.from))
    .slice(0, 4)

  const save = (b) => {
    const isNew = !b.id
    // טלפון נשמר רק כשמישהו מזמין לעצמו (לא כשמנהל משבץ שבט)
    const clean = { ...b, phone: b.who === me ? (profile.phone || '') : '' }
    const saved = isNew ? { ...clean, id: newId() } : clean
    setList((l) => isNew ? [...l, saved] : l.map((x) => x.id === b.id ? saved : x))
    const when = b.date ? dayLabel(b.date) : `כל יום ${DAYS[b.day]}`
    if (tribes.includes(b.who)) notify({ text: `שיבוץ חדר: ${b.who} ב${b.room}, ${when} ‎${b.from}–${b.to}‎`, kind: 'room', to: `tribe:${b.who}`, link: '/rooms' })
    setEditing(null)
  }
  const remove = (b) => { if (confirm('לבטל את ההזמנה?')) { setList((l) => l.filter((x) => x.id !== b.id)); setEditing(null) } }
  const shown = list.filter((b) => roomFilter === 'all' || b.room === roomFilter)
  const orgMonth = shown.filter((b) => b.date >= today && (b.note || '').includes('חודש ארגון')).map((b) => b.date).sort().pop()

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="חדרים" />

      <div className="rounded-3xl bg-gradient-to-br from-teal-500 to-teal-600 p-5 text-white shadow-lg">
        <div className="text-sm font-semibold text-white/80">השיבוצים שלי ושל {profile.tribe}</div>
        {mine.length === 0 ? <div className="mt-1 text-lg font-extrabold">אין שיבוצים. אפשר להזמין חדר פנוי 👇</div> : mine.map((b) => (
          <div key={b.id} className="mt-1 flex items-center gap-2 font-bold"><Icon name="DoorOpen" size={18} />{b.room} · {b.date ? dayLabel(b.date) : `כל יום ${DAYS[b.day]}`} <span dir="ltr">{b.from}–{b.to}</span></div>
        ))}
      </div>

      {/* מעבר בין שבועות */}
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-white p-2 shadow-card dark:bg-navy-900">
        <button onClick={() => setWeek((w) => Math.max(0, w - 1))} disabled={week === 0} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 disabled:opacity-30 dark:bg-white/10" aria-label="שבוע קודם"><Icon name="ChevronRight" size={20} /></button>
        <div className="flex-1 text-center">
          <div className="font-extrabold">{week === 0 ? 'השבוע' : week === 1 ? 'שבוע הבא' : `בעוד ${week} שבועות`}</div>
          <div className="text-xs text-slate-500" dir="ltr">{dm(days[0])} – {dm(days[6])}</div>
        </div>
        <button onClick={() => setWeek((w) => Math.min(12, w + 1))} className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-white/10" aria-label="שבוע הבא"><Icon name="ChevronLeft" size={20} /></button>
      </div>

      <div className="-mx-4 mt-3 overflow-x-auto px-4 pb-1">
        <div className="flex w-max gap-2">
          {[{ value: 'all', label: 'כל החדרים' }, ...rooms.map((r) => ({ value: r, label: r }))].map((o) => (
            <button key={o.value} onClick={() => setRoomFilter(o.value)} className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold transition ${roomFilter === o.value ? 'bg-teal-600 text-white' : 'bg-white shadow-card dark:bg-navy-900'}`}>{o.label}</button>
          ))}
        </div>
      </div>

      {orgMonth && (
        <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
          📌 לוח שיבוצים של חודש ארגון, עד {dm(orgMonth)}. אחרי זה כל אחד מזמין בעצמו.
        </div>
      )}

      <div className="mt-3 space-y-3">
        {days.map((iso) => {
          const past = iso < today
          const items = shown.filter((b) => isOn(b, iso)).sort((a, b) => toMin(a.from) - toMin(b.from) || a.room.localeCompare(b.room))
          const dt = parseISO(iso)
          return (
            <section key={iso} className={`overflow-hidden rounded-3xl bg-white shadow-card dark:bg-navy-900 ${past ? 'opacity-50' : ''}`}>
              <div className={`flex items-center gap-2 px-4 py-2.5 ${iso === today ? 'bg-teal-600 text-white' : 'bg-slate-50 dark:bg-white/5'}`}>
                <span className="font-extrabold">יום {DAYS[dt.getDay()]}</span>
                <span className={iso === today ? 'text-white/85' : 'text-slate-500'}>{dm(iso)}</span>
                {iso === today && <span className="rounded-full bg-white/25 px-2 text-xs font-bold">היום</span>}
                {!past && <button onClick={() => setEditing({ date: iso, room: roomFilter !== 'all' ? roomFilter : rooms[0] })} className={`mr-auto rounded-xl px-2.5 py-1 text-xs font-bold ${iso === today ? 'bg-white/20' : 'bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300'}`}>+ הזמנה</button>}
              </div>
              {items.length === 0 ? (
                <div className="px-4 py-2.5 text-sm font-semibold text-emerald-600">✓ הכול פנוי</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {items.map((b) => {
                    const note = (b.note || '').split(' · ').filter((x) => x !== 'חודש ארגון').join(' · ')
                    return (
                      <button key={b.id} disabled={!canEdit(b)} onClick={() => setEditing(b)} className={`flex w-full items-start gap-3 px-4 py-2.5 text-right ${isMine(b) ? 'bg-teal-50 dark:bg-teal-500/10' : ''}`}>
                        <span className="w-[92px] shrink-0 pt-0.5 text-sm font-extrabold tabular-nums text-navy-700 dark:text-accent-400" dir="ltr" style={{ textAlign: 'right' }}>{b.from}–{b.to}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold">{b.who}</span>
                          {(note || roomFilter === 'all') && <span className="block text-xs text-slate-500 dark:text-slate-400">{[roomFilter === 'all' ? b.room : null, note || null].filter(Boolean).join(' · ')}</span>}
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

      <Fab label="הזמנת חדר" onClick={() => setEditing({ date: days.find((d) => d >= today) || today, room: roomFilter !== 'all' ? roomFilter : rooms[0] })} />
      {editing && <BookingForm initial={editing} list={list} rooms={rooms} tribes={tribes} profile={profile} isAdmin={isAdmin}
        onClose={() => setEditing(null)} onSave={save} onDelete={editing.id ? () => remove(editing) : null} />}
    </div>
  )
}

function BookingForm({ initial, list, rooms, tribes, profile, isAdmin, onClose, onSave, onDelete }) {
  const me = fullName(profile)
  const [b, setB] = useState({ room: rooms[0], from: '16:00', to: '17:30', who: profile.tribe, by: me, date: todayISO(), ...initial })
  const weekly = b.day != null
  const clash = findClash(list, b)
  const badTime = toMin(b.to) <= toMin(b.from)
  const pastDate = !weekly && b.date < todayISO()
  const setWeekly = (on) => setB(on ? { ...b, day: b.date ? dayOf(b.date) : 6, date: undefined } : { ...b, day: undefined, date: todayISO() })
  const whoOptions = [...new Set([profile.tribe, me, ...tribes])]

  return (
    <Sheet title={initial.id ? 'עריכת הזמנה' : 'הזמנת חדר'} onClose={onClose}>
      <div className="space-y-4">
        <div><div className="mb-1.5 text-sm font-semibold">איזה חדר</div><Chips options={rooms} value={b.room} onChange={(room) => setB({ ...b, room })} small /></div>
        {isAdmin && <Chips cols={2} small options={[{ value: false, label: 'פעם אחת' }, { value: true, label: 'קבוע כל שבוע' }]} value={weekly} onChange={setWeekly} />}
        {weekly ? (
          <div><div className="mb-1.5 text-sm font-semibold">איזה יום בשבוע</div><Chips options={DAYS.map((d, i) => ({ value: i, label: d }))} value={b.day} onChange={(day) => setB({ ...b, day })} small /></div>
        ) : (
          <label className="block"><span className="mb-1.5 block text-sm font-semibold">תאריך</span>
            <input type="date" className={field} min={todayISO()} value={b.date} onChange={(e) => setB({ ...b, date: e.target.value })} />
            {b.date && <span className="mt-1 block text-xs text-slate-500">{dayLabel(b.date)}</span>}
          </label>
        )}
        <div className="grid grid-cols-2 gap-2">
          <label><span className="mb-1 block text-sm font-semibold">משעה</span><input type="time" className={field} value={b.from} onChange={(e) => setB({ ...b, from: e.target.value })} /></label>
          <label><span className="mb-1 block text-sm font-semibold">עד שעה</span><input type="time" className={field} value={b.to} onChange={(e) => setB({ ...b, to: e.target.value })} /></label>
        </div>
        <div><div className="mb-1.5 text-sm font-semibold">בשביל מי</div><Chips options={isAdmin ? whoOptions : [profile.tribe, me]} value={b.who} onChange={(who) => setB({ ...b, who })} small /></div>
        {clash && <Taken what="החדר תפוס בשעה הזאת" who={clash.who} phone={clash.who === clash.by ? clash.phone : ''} />}
        {clash && <p className="-mt-2 text-sm text-slate-500">{clash.room}: <span dir="ltr">{clash.from}–{clash.to}</span>{clash.day != null ? ` · קבוע כל יום ${DAYS[clash.day]}` : ''}</p>}
        {badTime && <p className="text-sm text-rose-600">שעת הסיום צריכה להיות אחרי שעת ההתחלה</p>}
        {pastDate && <p className="text-sm text-rose-600">אי אפשר להזמין לתאריך שעבר</p>}
        <button disabled={!!clash || badTime || pastDate || !b.date && !weekly} onClick={() => onSave(b)} className={primaryBtn}>{clash ? 'החדר תפוס' : 'שמירה'}</button>
        {onDelete && <button onClick={onDelete} className="w-full py-2 font-semibold text-rose-600">ביטול ההזמנה</button>}
      </div>
    </Sheet>
  )
}
