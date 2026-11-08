import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import Fab from '../components/Fab'
import Chips from '../components/Chips'
import { useReports, useAdmin, fullName, notify } from '../data/hooks'
import { timeAgo } from '../data/dates'
import { newId } from '../data/store'

export const REPORT_TYPES = {
  fault: { label: 'תקלה בסניף', icon: 'Wrench', hint: 'משהו שבור, נורה, מזגן' },
  summary: { label: 'סיכום פעולה', icon: 'FileText', hint: 'כמה ילדים הגיעו, מה עשינו, הערות' },
  incident: { label: 'אירוע חריג', icon: 'AlertTriangle', hint: 'משהו שהקומונרית צריכה לדעת' },
  request: { label: 'בקשה כללית', icon: 'HelpCircle', hint: '' },
}
const STATUS = { new: 'חדש', progress: 'בטיפול', done: 'טופל' }
const statusCls = { new: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', progress: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', done: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' }

export default function Reports({ profile }) {
  const [list, setList] = useReports()
  const [isAdmin] = useAdmin()
  const [writing, setWriting] = useState(false)
  const [filter, setFilter] = useState('open')
  const [photo, setPhoto] = useState(null)
  const me = fullName(profile)
  const visible = (isAdmin ? list : list.filter((r) => r.by === me))
    .filter((r) => filter === 'all' || (filter === 'open' ? r.status !== 'done' : r.status === 'done'))
    .sort((a, b) => (b.urgent && b.status !== 'done') - (a.urgent && a.status !== 'done') || b.createdAt - a.createdAt)

  const send = (r) => {
    setList((l) => [{ ...r, id: newId(), by: me, status: 'new', createdAt: Date.now() }, ...l])
    notify({ text: `${r.urgent ? '🚨 דחוף! ' : ''}${REPORT_TYPES[r.type].label} מ${me}: ${r.text.slice(0, 60)}`, kind: 'report', to: 'admins', link: '/reports' })
    setWriting(false)
  }
  const setStatus = (r, status) => {
    setList((l) => l.map((x) => x.id === r.id ? { ...x, status } : x))
    notify({ text: `הדיווח שלך "${REPORT_TYPES[r.type].label}" עכשיו: ${STATUS[status]}`, kind: 'report', to: r.by, link: '/reports' })
  }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="דיווחים" />
      <p className="mb-3 px-1 text-sm text-slate-500 dark:text-slate-400">{isAdmin ? 'כל הדיווחים של הצוות' : 'הדיווחים ששלחתי'}</p>
      <Chips options={[{ value: 'open', label: 'פתוחים' }, { value: 'done', label: 'טופלו' }, { value: 'all', label: 'הכול' }]} value={filter} onChange={setFilter} small />

      <div className="mt-4 space-y-3">
        {visible.length === 0 && <p className="mt-8 text-center text-slate-400">אין דיווחים כאן</p>}
        {visible.map((r) => {
          const t = REPORT_TYPES[r.type]
          return (
            <article key={r.id} className={`rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900 ${r.urgent && r.status !== 'done' ? 'ring-2 ring-rose-500' : ''}`}>
              <div className="flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"><Icon name={t.icon} size={18} /></div>
                <div className="flex-1"><div className="font-bold">{t.label}</div><div className="text-xs text-slate-400">{r.by} · {timeAgo(r.createdAt)}</div></div>
                {r.urgent && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-bold text-white">דחוף</span>}
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusCls[r.status]}`}>{STATUS[r.status]}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-[15px] text-slate-700 dark:text-slate-300">{r.text}</p>
              {r.image && <button onClick={() => setPhoto(r.image)} className="mt-2 block"><img src={r.image} alt="" className="h-28 rounded-2xl object-cover" /></button>}
              {isAdmin && (
                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {Object.entries(STATUS).map(([k, l]) => (
                    <button key={k} onClick={() => setStatus(r, k)} className={`rounded-xl py-2 text-sm font-bold ${r.status === k ? statusCls[k] + ' ring-2 ring-current' : 'bg-slate-50 text-slate-500 dark:bg-white/5'}`}>{l}</button>
                  ))}
                </div>
              )}
            </article>
          )
        })}
      </div>

      <Fab label="דיווח חדש" onClick={() => setWriting(true)} />
      {writing && <ReportForm onClose={() => setWriting(false)} onSend={send} />}
      {photo && <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setPhoto(null)}><img src={photo} alt="" className="max-h-full max-w-full rounded-2xl" /></div>}
    </div>
  )
}

// מקטין תמונה לפני השמירה כדי שלא תתפוס הרבה מקום
function shrink(file) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(1, 1000 / Math.max(img.width, img.height))
      const c = document.createElement('canvas'); c.width = img.width * s; c.height = img.height * s
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      res(c.toDataURL('image/jpeg', 0.7)); URL.revokeObjectURL(img.src)
    }
    img.onerror = () => res(null)
    img.src = URL.createObjectURL(file)
  })
}

function ReportForm({ onClose, onSend }) {
  const [type, setType] = useState('fault')
  const [text, setText] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [image, setImage] = useState(null)
  return (
    <Sheet title="דיווח חדש" onClose={onClose}>
      <div className="space-y-3">
        <Chips cols={2} options={Object.entries(REPORT_TYPES).map(([value, t]) => ({ value, label: t.label }))} value={type} onChange={setType} small />
        <textarea className={`${field} min-h-28`} value={text} onChange={(e) => setText(e.target.value)} placeholder={REPORT_TYPES[type].hint || 'מה רוצים לבקש?'} />
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-navy-950">
          <Icon name="Camera" size={20} className="text-slate-500" />
          <span className="flex-1 font-semibold">{image ? 'תמונה צורפה ✓' : 'צירוף תמונה (לא חובה)'}</span>
          {image && <img src={image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => e.target.files[0] && setImage(await shrink(e.target.files[0]))} />
        </label>
        <Chips cols={2} options={[{ value: false, label: 'רגיל' }, { value: true, label: '🚨 דחוף' }]} value={urgent} onChange={setUrgent} />
        <button disabled={!text.trim()} onClick={() => onSend({ type, text: text.trim(), urgent, image })} className={primaryBtn}>שליחה</button>
      </div>
    </Sheet>
  )
}
