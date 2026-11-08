import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import { useLoans, useAdmin, useSettings, fullName, notify } from '../data/hooks'
import { fmtDateTime } from '../data/dates'
import { newId } from '../data/store'

// מצב הרמקול כרגע: אצל מישהו / שמור / פנוי
export function speakerStatus(loans) {
  const active = loans.find((l) => l.status === 'active')
  if (active) return { kind: 'out', loan: active, label: `אצל ${active.user}`, color: 'rose' }
  const next = loans.filter((l) => l.status === 'approved').sort((a, b) => a.from - b.from)[0]
  if (next) return { kind: 'reserved', loan: next, label: `שמור ל${next.user}`, color: 'amber' }
  return { kind: 'free', label: 'פנוי בסניף', color: 'green' }
}

const statusText = { pending: 'מחכה לאישור', approved: 'מאושר', active: 'אצלו עכשיו', returned: 'הוחזר', rejected: 'נדחה' }
const statusCls = { pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', active: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300', returned: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300', rejected: 'bg-slate-100 text-slate-500 dark:bg-white/10' }

const toLocalInput = (ts) => { const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function Speaker({ profile }) {
  const [loans, setLoans] = useLoans()
  const [isAdmin] = useAdmin()
  const [{ speakerApproval }] = useSettings()
  const [asking, setAsking] = useState(false)
  const me = fullName(profile)
  const st = speakerStatus(loans)
  const update = (id, patch) => setLoans((l) => l.map((x) => x.id === id ? { ...x, ...patch } : x))
  const myOpen = loans.filter((l) => l.user === me && ['pending', 'approved', 'active'].includes(l.status))
  const pending = loans.filter((l) => l.status === 'pending')
  const history = [...loans].sort((a, b) => b.createdAt - a.createdAt)

  const request = (r) => {
    const loan = { ...r, id: newId(), user: me, createdAt: Date.now(), status: speakerApproval ? 'pending' : (r.from <= Date.now() ? 'active' : 'approved'), takenAt: !speakerApproval && r.from <= Date.now() ? Date.now() : null }
    setLoans((l) => [loan, ...l])
    if (speakerApproval) notify({ text: `${me} מבקש/ת את הרמקול: ${r.purpose}`, kind: 'speaker', to: 'admins', link: '/speaker' })
    setAsking(false)
  }
  const decide = (l, ok) => {
    update(l.id, { status: ok ? 'approved' : 'rejected' })
    notify({ text: ok ? 'הבקשה שלך לרמקול אושרה ✓' : 'הבקשה שלך לרמקול נדחתה', kind: 'speaker', to: l.user, link: '/speaker' })
  }
  const take = (l) => update(l.id, { status: 'active', takenAt: Date.now() })
  const giveBack = (l) => { update(l.id, { status: 'returned', returnedAt: Date.now() }); notify({ text: `${l.user} החזיר/ה את הרמקול לסניף`, kind: 'speaker', to: 'admins', link: '/speaker' }) }
  const conflict = st.kind === 'out' && st.loan.user !== me

  const big = { green: 'from-emerald-500 to-emerald-600', rose: 'from-rose-500 to-rose-600', amber: 'from-amber-400 to-amber-500' }[st.color]
  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="רמקול" />
      <div className={`rounded-3xl bg-gradient-to-br ${big} p-6 text-white shadow-lg`}>
        <Icon name="Speaker" size={32} />
        <div className="mt-3 text-3xl font-extrabold">{st.label}</div>
        {st.loan && <div className="mt-1 text-white/90">{st.kind === 'out' ? `מאז ${fmtDateTime(st.loan.takenAt || st.loan.from)} · מחזיר עד ${fmtDateTime(st.loan.to)}` : `מ-${fmtDateTime(st.loan.from)} עד ${fmtDateTime(st.loan.to)}`}</div>}
        {st.kind === 'out' && st.loan.to < Date.now() && <div className="mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-sm font-bold">⚠️ עבר זמן ההחזרה</div>}
      </div>

      {myOpen.map((l) => (
        <div key={l.id} className="mt-3 rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
          <div className="flex items-center gap-2"><span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusCls[l.status]}`}>{statusText[l.status]}</span><span className="text-sm text-slate-500">הבקשה שלי</span></div>
          <div className="mt-1 font-bold">{l.purpose}</div>
          <div className="text-sm text-slate-500">{fmtDateTime(l.from)} ← {fmtDateTime(l.to)}</div>
          {l.status === 'approved' && <button onClick={() => take(l)} disabled={conflict} className={`${primaryBtn} mt-3`}>{conflict ? 'הרמקול עוד אצל מישהו אחר' : 'לקחתי את הרמקול'}</button>}
          {l.status === 'active' && <button onClick={() => giveBack(l)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-lg font-bold text-white active:scale-[.98]"><Icon name="Undo2" size={20} />החזרתי</button>}
        </div>
      ))}

      {myOpen.length === 0 && (
        <button onClick={() => setAsking(true)} className={`${primaryBtn} mt-4`}>אני רוצה לקחת את הרמקול</button>
      )}
      <p className="mt-2 px-1 text-center text-xs text-slate-400">{speakerApproval ? 'כל השאלה צריכה אישור של מנהל' : 'השאלה מיידית, בלי צורך באישור'}</p>

      {isAdmin && pending.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-2 px-1 text-sm font-bold text-slate-500">בקשות שמחכות לאישור</h2>
          <div className="space-y-2">
            {pending.map((l) => (
              <div key={l.id} className="rounded-3xl bg-white p-4 shadow-card ring-2 ring-amber-400 dark:bg-navy-900">
                <div className="font-bold">{l.user}</div>
                <div className="text-sm">{l.purpose}</div>
                <div className="text-sm text-slate-500">{fmtDateTime(l.from)} ← {fmtDateTime(l.to)}</div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={() => decide(l, true)} className="rounded-xl bg-emerald-500 py-2.5 font-bold text-white">אישור</button>
                  <button onClick={() => decide(l, false)} className="rounded-xl bg-slate-100 py-2.5 font-bold dark:bg-white/10">דחייה</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 flex items-center gap-1.5 px-1 text-sm font-bold text-slate-500"><Icon name="History" size={16} />היסטוריה</h2>
        {history.length === 0 ? <p className="px-1 text-sm text-slate-400">עוד לא השאילו את הרמקול</p> : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
            {history.slice(0, 30).map((l) => (
              <div key={l.id} className="px-4 py-3">
                <div className="flex items-center gap-2"><span className="flex-1 font-bold">{l.user}</span><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusCls[l.status]}`}>{statusText[l.status]}</span></div>
                <div className="text-sm text-slate-500">{l.purpose}</div>
                <div className="text-xs text-slate-400">לקח: {fmtDateTime(l.takenAt || l.from)}{l.returnedAt && ` · החזיר: ${fmtDateTime(l.returnedAt)}`}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {asking && <RequestForm onClose={() => setAsking(false)} onSend={request} />}
    </div>
  )
}

function RequestForm({ onClose, onSend }) {
  const now = Date.now()
  const [from, setFrom] = useState(toLocalInput(now))
  const [to, setTo] = useState(toLocalInput(now + 3 * 3600000))
  const [purpose, setPurpose] = useState('')
  const f = new Date(from).getTime(), t = new Date(to).getTime()
  const bad = !(t > f)
  return (
    <Sheet title="בקשה לרמקול" onClose={onClose}>
      <div className="space-y-3">
        <label className="block"><span className="mb-1 block text-sm font-semibold">מתי לוקח</span><input type="datetime-local" className={field} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-sm font-semibold">מתי מחזיר</span><input type="datetime-local" className={field} value={to} onChange={(e) => setTo(e.target.value)} /></label>
        {bad && <p className="text-sm text-rose-600">זמן ההחזרה צריך להיות אחרי זמן הלקיחה</p>}
        <input className={field} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="לאיזה צורך? (פעולה, טיול...)" />
        <button disabled={bad || !purpose.trim()} onClick={() => onSend({ from: f, to: t, purpose: purpose.trim() })} className={primaryBtn}>שליחה</button>
      </div>
    </Sheet>
  )
}
