import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import Chips from '../components/Chips'
import StoredImage from '../components/StoredImage'
import { useRefunds, useAdmin, useSettings, fullName, notify } from '../data/hooks'
import { timeAgo, todayISO, fmtShort } from '../data/dates'
import { newId } from '../data/store'
import { online, saveImage } from '../firebase'
import { shrink } from './Reports'

// החזרים כספיים: מדריך קנה משהו לצוות, מעלה קבלה, והאחראית מאשרת ומחזירה את הכסף
const STATUS = { pending: 'מחכה לאישור', approved: 'אושר, מחכה להחזר', paid: 'הכסף הוחזר ✓', rejected: 'נדחה' }
// בקשת תקציב (לפני שקונים): רק מאשרים או דוחים
const BUDGET_STATUS = { pending: 'מחכה לאישור', approved: 'התקציב אושר ✓', rejected: 'נדחה' }
const isBudget = (r) => r.kind === 'budget'
const statusText = (r) => (isBudget(r) ? BUDGET_STATUS : STATUS)[r.status]
const statusCls = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  rejected: 'bg-slate-100 text-slate-500 dark:bg-white/10',
}
const money = (n) => `₪${Number(n || 0).toLocaleString('he-IL', { maximumFractionDigits: 2 })}`

export default function Refunds({ profile }) {
  const [list, setList] = useRefunds()
  const [isAdmin] = useAdmin()
  const [settings] = useSettings()
  const refundsManager = settings.refundsManager ?? 'נועה הדר'
  const [writing, setWriting] = useState(null) // 'refund' | 'budget'
  const [filter, setFilter] = useState('open')
  const [photo, setPhoto] = useState(null)
  const me = fullName(profile)
  // מי שמנהלת את ההחזרים (או מנהל) רואה את כל הבקשות
  const isManager = isAdmin || (refundsManager && me === refundsManager)
  const mine = isManager ? list : list.filter((r) => r.by === me)
  const visible = mine
    .filter((r) => { const open = r.status === 'pending' || (r.status === 'approved' && !isBudget(r)); return filter === 'all' || (filter === 'open' ? open : !open) })
    .sort((a, b) => b.createdAt - a.createdAt)
  const toPay = list.filter((r) => r.status === 'approved' && !isBudget(r)).reduce((s, r) => s + Number(r.amount || 0), 0)
  const waiting = list.filter((r) => r.status === 'pending').length
  const myOpen = list.filter((r) => r.by === me && !isBudget(r) && ['pending', 'approved'].includes(r.status)).reduce((s, r) => s + Number(r.amount || 0), 0)

  const send = async (r) => {
    const id = newId()
    let receipt = r.receipt
    if (online && receipt) {
      try { await saveImage(id, receipt); receipt = `img:${id}` } catch { alert('העלאת הקבלה נכשלה. בדקו חיבור ונסו שוב.'); return false }
    }
    setList((l) => [{ ...r, receipt, id, by: me, phone: profile.phone || '', status: 'pending', createdAt: Date.now() }, ...l])
    notify({ text: r.kind === 'budget' ? `💰 בקשת תקציב מ${me}: ${money(r.amount)} ל${r.what}` : `🧾 בקשת החזר מ${me}: ${money(r.amount)} על ${r.what}`, kind: 'refund', to: refundsManager || 'admins', link: '/refunds' })
    setWriting(null)
    return true
  }
  const setStatus = (r, status) => {
    setList((l) => l.map((x) => x.id === r.id ? { ...x, status, [`${status}At`]: Date.now(), handledBy: me } : x))
    const msg = isBudget(r) ? { approved: `✅ בקשת התקציב שלך אושרה: ${money(r.amount)} ל${r.what}`, rejected: `בקשת התקציב שלך (${money(r.amount)} ל${r.what}) נדחתה` }[status] : { approved: `✅ ההחזר שלך (${money(r.amount)} על ${r.what}) אושר`, paid: `💸 הכסף הוחזר לך: ${money(r.amount)} על ${r.what}`, rejected: `ההחזר שלך (${money(r.amount)} על ${r.what}) נדחה` }[status]
    if (msg) notify({ text: msg, kind: 'refund', to: r.by, link: '/refunds' })
  }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="כספים" />

      {isManager ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900"><div className="text-2xl font-extrabold text-amber-600">{waiting}</div><div className="text-sm font-semibold text-slate-500">מחכים לאישור</div></div>
          <div className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900"><div className="text-2xl font-extrabold text-blue-600">{money(toPay)}</div><div className="text-sm font-semibold text-slate-500">אושרו ועוד לא הוחזרו</div></div>
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg">
          <div className="text-sm font-semibold text-white/85">צריכים כסף לפעולה, או קניתם משהו לצוות?</div>
          <div className="mt-1 text-lg font-extrabold">מבקשים תקציב מראש, או מעלים קבלה ו{refundsManager ? refundsManager.split(' ')[0] : 'האחראית'} מחזירה לכם את הכסף</div>
          {myOpen > 0 && <div className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-bold">מחכה לך: {money(myOpen)}</div>}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button onClick={() => setWriting('refund')} className="flex items-center justify-center gap-2 rounded-2xl bg-accent-500 py-3.5 font-bold text-white shadow-md active:scale-[.98]"><Icon name="Receipt" size={18} />בקשת החזר</button>
        <button onClick={() => setWriting('budget')} className="flex items-center justify-center gap-2 rounded-2xl bg-navy-700 py-3.5 font-bold text-white shadow-md active:scale-[.98] dark:bg-white/10"><Icon name="Wallet" size={18} />בקשת תקציב</button>
      </div>

      <div className="mt-4"><Chips small options={[{ value: 'open', label: 'פתוחים' }, { value: 'done', label: 'הסתיימו' }, { value: 'all', label: 'הכול' }]} value={filter} onChange={setFilter} /></div>

      <div className="mt-4 space-y-3">
        {visible.length === 0 && <p className="mt-8 text-center text-slate-400">אין בקשות כאן</p>}
        {visible.map((r) => (
          <article key={r.id} className="rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900">
            <div className="flex items-start gap-3">
              {isBudget(r) ? <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-white"><Icon name="Wallet" size={26} /></div> : r.receipt ? <StoredImage src={r.receipt} onOpen={setPhoto} className="h-16 w-16 shrink-0 rounded-2xl object-cover" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-slate-100 dark:bg-white/5"><Icon name="Receipt" size={24} className="text-slate-400" /></div>}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold">{money(r.amount)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${statusCls[r.status]}`}>{statusText(r)}</span>
                  {isBudget(r) && <span className="rounded-full bg-navy-100 px-2 py-0.5 text-[11px] font-bold text-navy-700 dark:bg-white/10 dark:text-white">תקציב</span>}
                </div>
                <div className="truncate font-bold">{r.what}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{r.by} · {r.date ? fmtShort(r.date) : timeAgo(r.createdAt)}</div>
                {r.note && <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{r.note}</div>}
                {isManager && r.phone && <a href={`tel:${r.phone}`} className="text-xs font-semibold text-navy-600 dark:text-accent-400" dir="ltr">{r.phone}</a>}
              </div>
            </div>
            {isManager && r.status === 'pending' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button onClick={() => setStatus(r, 'approved')} className="rounded-xl bg-emerald-500 py-2.5 font-bold text-white active:scale-95">אישור</button>
                <button onClick={() => { if (confirm('לדחות את הבקשה?')) setStatus(r, 'rejected') }} className="rounded-xl bg-slate-100 py-2.5 font-bold active:scale-95 dark:bg-white/10">דחייה</button>
              </div>
            )}
            {isManager && r.status === 'approved' && !isBudget(r) && (
              <button onClick={() => setStatus(r, 'paid')} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 font-bold text-white active:scale-95"><Icon name="Wallet" size={18} />החזרתי את הכסף</button>
            )}
          </article>
        ))}
      </div>

      {writing && <RefundForm kind={writing} onClose={() => setWriting(null)} onSend={send} />}
      {photo && <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4" onClick={() => setPhoto(null)}><img src={photo} alt="" className="max-h-full max-w-full rounded-2xl" /></div>}
    </div>
  )
}

function RefundForm({ kind, onClose, onSend }) {
  const budget = kind === 'budget'
  const [what, setWhat] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [busy, setBusy] = useState(false)
  const amt = Number(String(amount).replace(',', '.'))
  const ok = what.trim() && amt > 0 && (budget || receipt)
  return (
    <Sheet title={budget ? 'בקשת תקציב' : 'בקשת החזר כספי'} onClose={onClose}>
      <div className="space-y-3">
        {budget && <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300">מבקשים לפני שקונים. אחרי שהתקציב מאושר וקניתם, מעלים את הקבלה ב"בקשת החזר".</p>}
        {!budget && <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-4 ${receipt ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-300 bg-slate-50 dark:border-white/15 dark:bg-navy-950'}`}>
          {receipt ? <img src={receipt} alt="" className="h-14 w-14 rounded-xl object-cover" /> : <Icon name="Camera" size={26} className="text-slate-500" />}
          <span className="flex-1 font-bold">{receipt ? 'הקבלה צורפה ✓ (לחיצה להחלפה)' : 'צילום הקבלה (חובה)'}</span>
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => e.target.files[0] && setReceipt(await shrink(e.target.files[0]))} />
        </label>}
        <input className={field} value={what} onChange={(e) => setWhat(e.target.value)} placeholder={budget ? 'בשביל מה? (למשל: חומרים לפעולה)' : 'מה קנית? (למשל: חטיפים לפעולה)'} />
        <div className="grid grid-cols-2 gap-2">
          <label><span className="mb-1 block text-sm font-semibold">סכום (₪)</span><input className={field} value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="0" dir="ltr" style={{ textAlign: 'right' }} /></label>
          <label><span className="mb-1 block text-sm font-semibold">{budget ? 'מתי צריך' : 'תאריך הקנייה'}</span><input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></label>
        </div>
        <input className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="הערה (לא חובה, למשל: לאיזו פעולה)" />
        <button disabled={!ok || busy} onClick={async () => { setBusy(true); const done = await onSend({ kind: budget ? 'budget' : 'refund', what: what.trim(), amount: amt, date, note: note.trim(), receipt: budget ? null : receipt }); if (!done) setBusy(false) }} className={primaryBtn}>{busy ? 'שולח...' : 'שליחה לאישור'}</button>
        {!budget && !receipt && <p className="text-center text-xs text-slate-400">צריך לצרף צילום של הקבלה</p>}
      </div>
    </Sheet>
  )
}
