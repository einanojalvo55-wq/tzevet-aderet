import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import { useLoans, useAdmin, useSettings, fullName, notify } from '../data/hooks'
import { fmtDateTime } from '../data/dates'
import { newId } from '../data/store'
import speakerImg from '../assets/speaker.png'
import { useTeam, waLink } from '../data/team'

// למי מחזירים את הרמקול
export const SPEAKER_HOME = 'עינן'
export const SPEAKER_HOME_PHONE = '054-5775513'

// תנאי ההשאלה: כל מי שמשאיל חייב לאשר אותם
export const SPEAKER_TERMS = [
  'הרמקול באחריותך המלאה מרגע שלקחת אותו ועד שהחזרת.',
  'הרמקול מגיע אליך מלא בסוללה, ומחזירים אותו מלא בסוללה.',
  'מחזירים תמיד עם המטען.',
  'בלי מכות ובלי שריטות. שומרים עליו כמו על שלך.',
]

// מצב הרמקול כרגע: אצל מישהו / שמור / פנוי
export function speakerStatus(loans) {
  const active = loans.find((l) => l.status === 'active')
  if (active) return { kind: 'out', loan: active, label: `אצל ${active.user}`, color: 'rose' }
  const next = loans.filter((l) => l.status === 'approved').sort((a, b) => a.from - b.from)[0]
  if (next) return { kind: 'reserved', loan: next, label: `שמור ל${next.user}`, color: 'amber' }
  return { kind: 'free', label: 'פנוי', color: 'green' }
}

// טווח הזמן שבו הרמקול תפוס בגלל השאלה מסוימת
const span = (l) => ({ from: l.status === 'active' ? Math.min(l.takenAt || l.from, l.from) : l.from, to: Math.max(l.to, l.status === 'active' ? Date.now() : 0) })
export const BLOCKING = ['pending', 'approved', 'active']
// מחזיר השאלה קיימת שמתנגשת עם הזמן המבוקש (או כלום)
export function speakerClash(loans, from, to, exceptId) {
  return loans.find((l) => l.id !== exceptId && BLOCKING.includes(l.status) && from < span(l).to && span(l).from < to)
}

const statusText = { pending: 'מחכה לאישור', approved: 'מאושר', active: 'אצלו עכשיו', returned: 'הוחזר', rejected: 'נדחה' }
const statusCls = { pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300', approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300', active: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300', returned: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300', rejected: 'bg-slate-100 text-slate-500 dark:bg-white/10' }

const toLocalInput = (ts) => { const d = new Date(ts); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16) }

export default function Speaker({ profile }) {
  const [loans, setLoans] = useLoans()
  const [isAdmin] = useAdmin()
  const [{ speakerApproval }] = useSettings()
  const [asking, setAsking] = useState(false)
  const team = useTeam(profile)
  const me = fullName(profile)
  const st = speakerStatus(loans)
  const update = (id, patch) => setLoans((l) => l.map((x) => x.id === id ? { ...x, ...patch } : x))
  const myOpen = loans.filter((l) => l.user === me && ['pending', 'approved', 'active'].includes(l.status))
  const pending = loans.filter((l) => l.status === 'pending')
  const history = [...loans].sort((a, b) => b.createdAt - a.createdAt)

  const request = (r) => {
    const loan = { ...r, id: newId(), user: me, phone: profile.phone || '', createdAt: Date.now(), status: speakerApproval ? 'pending' : (r.from <= Date.now() ? 'active' : 'approved'), takenAt: !speakerApproval && r.from <= Date.now() ? Date.now() : null }
    setLoans((l) => [loan, ...l])
    if (speakerApproval) notify({ text: `${me} מבקש/ת את הרמקול: ${r.purpose}`, kind: 'speaker', to: 'admins', link: '/speaker' })
    setAsking(false)
  }
  // הטלפון של מי שביקש: שמור בבקשה, ואם לא, לפי רשימת הצוות
  const phoneOf = (l) => l.phone || (team || []).find((u) => `${u.firstName} ${u.lastName}` === l.user)?.phone || ''
  // אחרי אישור: נפתח וואטסאפ עם הודעה מוכנה למי שביקש
  const sendApproval = (l) => window.open(waLink(phoneOf(l), approvalMessage(l)), '_blank')
  const decide = (l, ok) => {
    update(l.id, { status: ok ? 'approved' : 'rejected' })
    notify({ text: ok ? 'הבקשה שלך לרמקול אושרה ✓' : 'הבקשה שלך לרמקול נדחתה', kind: 'speaker', to: l.user, link: '/speaker' })
    if (ok) sendApproval(l)
  }
  const take = (l) => update(l.id, { status: 'active', takenAt: Date.now() })
  const giveBack = (l) => { update(l.id, { status: 'returned', returnedAt: Date.now() }); notify({ text: `${l.user} החזיר/ה את הרמקול`, kind: 'speaker', to: 'admins', link: '/speaker' }) }
  const conflict = st.kind === 'out' && st.loan.user !== me

  const big = { green: 'from-emerald-500 to-emerald-700', rose: 'from-rose-500 to-rose-700', amber: 'from-amber-400 to-amber-600' }[st.color]
  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="רמקול" />
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${big} p-5 text-white shadow-lg`}>
        <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white/80">JBL PartyBox · הרמקול של הצוות</div>
            <div className="mt-1 text-[28px] font-extrabold leading-tight">{st.label}</div>
            {st.loan && <div className="mt-1 text-sm text-white/90">{st.kind === 'out' ? `מאז ${fmtDateTime(st.loan.takenAt || st.loan.from)} · מחזיר עד ${fmtDateTime(st.loan.to)}` : `מ-${fmtDateTime(st.loan.from)} עד ${fmtDateTime(st.loan.to)}`}</div>}
            {st.loan?.phone && <a href={`tel:${st.loan.phone}`} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-bold"><Icon name="Phone" size={14} /><span dir="ltr">{st.loan.phone}</span></a>}
            {st.kind === 'out' && st.loan.to < Date.now() && <div className="mt-2 inline-block rounded-full bg-white/25 px-3 py-1 text-sm font-bold">⚠️ עבר זמן ההחזרה</div>}
          </div>
          <img src={speakerImg} alt="הרמקול" className="h-32 w-32 shrink-0 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,.35)]" />
        </div>
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
      <Terms />

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
                  <button onClick={() => decide(l, true)} className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 font-bold text-white"><Icon name="MessageCircle" size={16} />אישור ושליחה בוואטסאפ</button>
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
                {l.phone && <a href={`tel:${l.phone}`} className="text-sm font-semibold text-navy-600 dark:text-accent-400" dir="ltr">{l.phone}</a>}
                {isAdmin && ['approved', 'active'].includes(l.status) && <button onClick={() => sendApproval(l)} className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><Icon name="MessageCircle" size={13} />שליחת האישור בוואטסאפ</button>}
                <div className="text-xs text-slate-400">לקח: {fmtDateTime(l.takenAt || l.from)}{l.returnedAt && ` · החזיר: ${fmtDateTime(l.returnedAt)}`}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {asking && <RequestForm loans={loans} onClose={() => setAsking(false)} onSend={request} />}
    </div>
  )
}

function RequestForm({ loans, onClose, onSend }) {
  const now = Date.now()
  const [from, setFrom] = useState(toLocalInput(now))
  const [to, setTo] = useState(toLocalInput(now + 3 * 3600000))
  const [purpose, setPurpose] = useState('')
  const [agree, setAgree] = useState(false)
  const f = new Date(from).getTime(), t = new Date(to).getTime()
  const bad = !(t > f)
  const clash = !bad && speakerClash(loans, f, t)
  return (
    <Sheet title="בקשה לרמקול" onClose={onClose}>
      <div className="space-y-3">
        <label className="block"><span className="mb-1 block text-sm font-semibold">מתי לוקח</span><input type="datetime-local" className={field} value={from} onChange={(e) => setFrom(e.target.value)} /></label>
        <label className="block"><span className="mb-1 block text-sm font-semibold">מתי מחזיר</span><input type="datetime-local" className={field} value={to} onChange={(e) => setTo(e.target.value)} /></label>
        {bad && <p className="text-sm text-rose-600">זמן ההחזרה צריך להיות אחרי זמן הלקיחה</p>}
        {clash && <Taken who={clash.user} phone={clash.phone} from={span(clash).from} to={span(clash).to} what="הרמקול תפוס בזמן הזה" />}
        <input className={field} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="לאיזה צורך? (פעולה, אירוע...)" />
        <div className="rounded-2xl bg-amber-50 p-3 dark:bg-amber-500/10">
          <div className="mb-1.5 text-sm font-extrabold text-amber-800 dark:text-amber-300">לפני שלוקחים:</div>
          <ul className="space-y-1 text-sm text-amber-900 dark:text-amber-200">{SPEAKER_TERMS.map((x) => <li key={x}>• {x}</li>)}<li>• לוקחים ומחזירים מ{SPEAKER_HOME}: <span dir="ltr">{SPEAKER_HOME_PHONE}</span></li></ul>
          <button type="button" onClick={() => setAgree(!agree)} className="mt-3 flex w-full items-center gap-3 text-right">
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 ${agree ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-amber-400 bg-white dark:bg-navy-950'}`}>{agree && <Icon name="Check" size={16} />}</span>
            <span className="font-bold text-amber-900 dark:text-amber-200">קראתי ואני מסכים/ה לכל התנאים</span>
          </button>
        </div>
        <button disabled={bad || !!clash || !purpose.trim() || !agree} onClick={() => onSend({ from: f, to: t, purpose: purpose.trim(), agreedTerms: true })} className={primaryBtn}>שליחה</button>
      </div>
    </Sheet>
  )
}

function Terms() {
  return (
    <section className="mt-4 rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
      <h2 className="mb-2 flex items-center gap-2 font-extrabold"><Icon name="ShieldCheck" size={18} className="text-emerald-600" />כללי השאלה</h2>
      <ul className="space-y-1.5">
        {SPEAKER_TERMS.map((t) => (
          <li key={t} className="flex gap-2 text-[15px] text-slate-600 dark:text-slate-300"><Icon name="Check" size={16} className="mt-1 shrink-0 text-emerald-500" />{t}</li>
        ))}
      </ul>
      <a href={`tel:${SPEAKER_HOME_PHONE}`} className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 font-bold dark:bg-white/5">
        <Icon name="Phone" size={16} className="text-rose-600" />לוקחים ומחזירים מ{SPEAKER_HOME}<span className="mr-auto text-slate-500" dir="ltr">{SPEAKER_HOME_PHONE}</span>
      </a>
    </section>
  )
}

// הודעה אדומה: מי תפס ועם איזה טלפון
export function Taken({ what, who, phone, from, to }) {
  return (
    <div className="rounded-2xl bg-rose-50 p-3 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200">
      <div className="flex items-center gap-2 font-extrabold"><Icon name="AlertTriangle" size={18} />{what}</div>
      <div className="mt-1 text-sm">תפוס על ידי <b>{who}</b>{from != null && <> · {fmtDateTime(from)} עד {fmtDateTime(to)}</>}</div>
      {phone && <a href={`tel:${phone}`} className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-sm font-bold text-rose-700 shadow-sm dark:bg-navy-950"><Icon name="Phone" size={14} /><span dir="ltr">{phone}</span></a>}
    </div>
  )
}

// ההודעה שנשלחת בוואטסאפ למי שקיבל אישור
export function approvalMessage(l) {
  const first = (l.user || '').split(' ')[0]
  return [
    `היי ${first}! 👋`,
    'אישרתי לך את הרמקול 🔊✅',
    '',
    `📅 מ-${fmtDateTime(l.from)} עד ${fmtDateTime(l.to)}`,
    l.purpose ? `🎯 ${l.purpose}` : null,
    '',
    '*תזכורת לכללים:*',
    ...SPEAKER_TERMS.map((t) => `✅ ${t}`),
    '',
    `📍 בוא/י נתאם מתי לוקחים ממני ומתי מחזירים 🙂`,
  ].filter((x) => x !== null).join('\n')
}
