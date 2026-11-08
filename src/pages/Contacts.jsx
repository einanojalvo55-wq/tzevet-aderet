import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import { useContacts, useAdmin } from '../data/hooks'
import { CONTACT_CATEGORIES } from '../data/seed'
import { newId } from '../data/store'

// מספר ישראלי לפורמט של וואטסאפ (0501234567 → 972501234567)
const waNumber = (p) => p.replace(/\D/g, '').replace(/^0/, '972')

function Row({ c, isAdmin, onEdit, onStar }) {
  const long = c.phone.replace(/\D/g, '').length >= 9
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <a href={`tel:${c.phone}`} className="flex min-w-0 flex-1 items-center gap-3 active:opacity-60">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"><Icon name="Phone" size={20} /></div>
        <div className="min-w-0">
          <div className="truncate font-bold">{c.name}{c.role && <span className="font-normal text-slate-500 dark:text-slate-400"> · {c.role}</span>}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400" dir="ltr" style={{ textAlign: 'right' }}>{c.phone}</div>
        </div>
      </a>
      {long && (
        <a href={`https://wa.me/${waNumber(c.phone)}`} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700 active:scale-95 dark:bg-emerald-500/15 dark:text-emerald-300" aria-label="וואטסאפ">
          <Icon name="MessageCircle" size={19} />
        </a>
      )}
      {isAdmin && (
        <>
          <button onClick={onStar} className={c.starred ? 'text-accent-500' : 'text-slate-300'} aria-label="מועדף"><Icon name="Star" size={20} fill={c.starred ? 'currentColor' : 'none'} /></button>
          <button onClick={onEdit} className="text-slate-400" aria-label="עריכה"><Icon name="Pencil" size={18} /></button>
        </>
      )}
    </div>
  )
}

function Group({ title, items, ...rest }) {
  if (!items.length) return null
  return (
    <section className="mt-5">
      <h2 className="mb-2 px-1 text-sm font-bold text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
        {items.map((c) => <Row key={c.id} c={c} {...rest} onEdit={() => rest.onEdit(c)} onStar={() => rest.onStar(c)} />)}
      </div>
    </section>
  )
}

export default function Contacts() {
  const [list, setList] = useContacts()
  const [isAdmin] = useAdmin()
  const [editing, setEditing] = useState(null) // null = סגור, {} = חדש
  const starred = list.filter((c) => c.starred)
  const props = { isAdmin, onEdit: setEditing, onStar: (c) => setList((l) => l.map((x) => x.id === c.id ? { ...x, starred: !x.starred } : x)) }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="מספרים חשובים" />
      <p className="px-1 text-sm text-slate-500 dark:text-slate-400">לחיצה על שם מתקשרת. הכפתור הירוק פותח וואטסאפ.</p>
      <Group title="⭐ הכי חשובים" items={starred} {...props} />
      {CONTACT_CATEGORIES.map((cat) => <Group key={cat} title={cat} items={list.filter((c) => c.category === cat && !c.starred)} {...props} />)}

      {isAdmin && (
        <button onClick={() => setEditing({})} className="fixed bottom-24 left-5 z-20 flex items-center gap-2 rounded-full bg-accent-500 px-5 py-3.5 font-bold text-white shadow-xl active:scale-95">
          <Icon name="Plus" size={20} /> מספר חדש
        </button>
      )}
      {editing && (
        <ContactForm initial={editing} onClose={() => setEditing(null)}
          onSave={(c) => { setList((l) => c.id && l.some((x) => x.id === c.id) ? l.map((x) => x.id === c.id ? c : x) : [...l, { ...c, id: newId() }]); setEditing(null) }}
          onDelete={editing.id ? () => { if (confirm('למחוק את המספר?')) { setList((l) => l.filter((x) => x.id !== editing.id)); setEditing(null) } } : null} />
      )}
    </div>
  )
}

function ContactForm({ initial, onClose, onSave, onDelete }) {
  const [c, setC] = useState({ name: '', role: '', phone: '', category: CONTACT_CATEGORIES[1], starred: false, ...initial })
  const set = (k) => (e) => setC({ ...c, [k]: e.target.value })
  return (
    <Sheet title={initial.id ? 'עריכת מספר' : 'מספר חדש'} onClose={onClose}>
      <div className="space-y-3">
        <input className={field} value={c.name} onChange={set('name')} placeholder="שם" />
        <input className={field} value={c.role} onChange={set('role')} placeholder="תפקיד (לא חובה)" />
        <input className={field} value={c.phone} onChange={set('phone')} placeholder="טלפון" inputMode="tel" dir="ltr" style={{ textAlign: 'right' }} />
        <div className="grid grid-cols-4 gap-2">
          {CONTACT_CATEGORIES.map((cat) => (
            <button key={cat} type="button" onClick={() => setC({ ...c, category: cat })}
              className={`rounded-2xl py-2.5 text-sm font-semibold ${c.category === cat ? 'bg-navy-700 text-white dark:bg-accent-500 dark:text-navy-950' : 'bg-slate-100 dark:bg-white/5'}`}>{cat}</button>
          ))}
        </div>
        <button disabled={!c.name.trim() || !c.phone.trim()} onClick={() => onSave({ ...c, name: c.name.trim(), phone: c.phone.trim() })} className={primaryBtn}>שמירה</button>
        {onDelete && <button onClick={onDelete} className="w-full py-2 font-semibold text-rose-600">מחיקה</button>}
      </div>
    </Sheet>
  )
}
