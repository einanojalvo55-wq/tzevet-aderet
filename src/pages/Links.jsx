import { useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import Fab from '../components/Fab'
import { useLinks, useAdmin } from '../data/hooks'
import { newId } from '../data/store'

// מוסיף https:// אם שכחו
const fixUrl = (u) => (/^https?:\/\//i.test(u) ? u : `https://${u}`)
const host = (u) => { try { return new URL(fixUrl(u)).hostname.replace(/^www\./, '') } catch { return u } }

export default function Links() {
  const [list, setList] = useLinks()
  const [isAdmin] = useAdmin()
  const [editing, setEditing] = useState(null)

  const save = (l) => {
    const item = { ...l, url: fixUrl(l.url.trim()), title: l.title.trim() }
    setList((cur) => item.id ? cur.map((x) => x.id === item.id ? item : x) : [...cur, { ...item, id: newId() }])
    setEditing(null)
  }
  const remove = (l) => { if (confirm('למחוק את הקישור?')) { setList((cur) => cur.filter((x) => x.id !== l.id)); setEditing(null) } }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="קישורים חשובים" />
      {list.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center text-slate-400">
          <Icon name="Link" size={40} /><p className="mt-3">{isAdmin ? 'עוד אין קישורים. לחצו "קישור חדש" כדי להוסיף.' : 'עוד אין קישורים'}</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
          {list.map((l) => (
            <div key={l.id} className="flex items-center gap-3 px-4 py-3">
              <a href={l.url} target="_blank" rel="noreferrer" className="flex min-w-0 flex-1 items-center gap-3 active:opacity-60">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"><Icon name="Link" size={20} /></div>
                <div className="min-w-0">
                  <div className="truncate font-bold">{l.title}</div>
                  <div className="truncate text-sm text-slate-500 dark:text-slate-400">{l.desc || host(l.url)}</div>
                </div>
              </a>
              {isAdmin ? <button onClick={() => setEditing(l)} className="text-slate-400" aria-label="עריכה"><Icon name="Pencil" size={18} /></button>
                : <Icon name="ExternalLink" size={18} className="text-slate-300" />}
            </div>
          ))}
        </div>
      )}
      {isAdmin && <Fab label="קישור חדש" onClick={() => setEditing({})} />}
      {editing && <LinkForm initial={editing} onClose={() => setEditing(null)} onSave={save} onDelete={editing.id ? () => remove(editing) : null} />}
    </div>
  )
}

function LinkForm({ initial, onClose, onSave, onDelete }) {
  const [l, setL] = useState({ title: '', url: '', desc: '', ...initial })
  const set = (k) => (e) => setL({ ...l, [k]: e.target.value })
  return (
    <Sheet title={initial.id ? 'עריכת קישור' : 'קישור חדש'} onClose={onClose}>
      <div className="space-y-3">
        <input className={field} value={l.title} onChange={set('title')} placeholder="שם הקישור (למשל: טופס הרשמה לטיול)" />
        <input className={field} value={l.url} onChange={set('url')} placeholder="כתובת" type="url" inputMode="url" dir="ltr" style={{ textAlign: 'right' }} />
        <input className={field} value={l.desc} onChange={set('desc')} placeholder="תיאור קצר (לא חובה)" />
        <button disabled={!l.title.trim() || !l.url.trim()} onClick={() => onSave(l)} className={primaryBtn}>שמירה</button>
        {onDelete && <button onClick={onDelete} className="w-full py-2 font-semibold text-rose-600">מחיקה</button>}
      </div>
    </Sheet>
  )
}
