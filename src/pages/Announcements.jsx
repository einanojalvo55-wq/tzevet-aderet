import { useEffect, useState } from 'react'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import Sheet, { field, primaryBtn } from '../components/Sheet'
import { useAnnouncements, useReadIds, useAdmin, sortAnnouncements } from '../data/hooks'
import { newId } from '../data/store'

function timeAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return 'עכשיו'
  if (m < 60) return `לפני ${m} דק׳`
  const h = Math.round(m / 60)
  if (h < 24) return `לפני ${h} שע׳`
  return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
}

export default function Announcements({ profile }) {
  const [list, setList] = useAnnouncements()
  const [readIds, setReadIds] = useReadIds()
  const [isAdmin] = useAdmin()
  const [composing, setComposing] = useState(false)
  const [unreadAtOpen] = useState(() => new Set(list.filter((a) => !readIds.includes(a.id)).map((a) => a.id)))

  // כשנכנסים למסך, כל ההודעות מסומנות כנקראו (אבל עדיין מודגשות בביקור הזה)
  useEffect(() => { setReadIds(list.map((a) => a.id)) }, [list.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const remove = (id) => { if (confirm('למחוק את ההודעה?')) setList((l) => l.filter((a) => a.id !== id)) }

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-44">
      <PageHeader title="הודעות" />
      {list.length === 0 && <p className="mt-10 text-center text-slate-500">אין הודעות עדיין</p>}
      <div className="space-y-3">
        {sortAnnouncements(list).map((a) => (
          <article key={a.id} className={`rounded-3xl bg-white p-4 shadow-card dark:bg-navy-900 ${a.important ? 'ring-2 ring-accent-500' : ''}`}>
            <div className="flex items-center gap-2 text-xs font-semibold">
              {a.important && <span className="flex items-center gap-1 rounded-full bg-accent-500/15 px-2 py-0.5 text-accent-600 dark:text-accent-400"><Icon name="Pin" size={12} />חשוב</span>}
              {unreadAtOpen.has(a.id) && <span className="rounded-full bg-navy-500 px-2 py-0.5 text-white">חדש</span>}
              <span className="text-slate-400">{a.author} · {timeAgo(a.createdAt)}</span>
              {isAdmin && <button onClick={() => remove(a.id)} className="mr-auto text-slate-400 active:text-rose-600" aria-label="מחיקה"><Icon name="Trash2" size={16} /></button>}
            </div>
            <h2 className="mt-1.5 text-lg font-bold leading-snug">{a.title}</h2>
            {a.body && <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">{a.body}</p>}
          </article>
        ))}
      </div>

      {isAdmin && (
        <button onClick={() => setComposing(true)} className="fixed bottom-24 left-5 z-20 flex items-center gap-2 rounded-full bg-accent-500 px-5 py-3.5 font-bold text-white shadow-xl active:scale-95">
          <Icon name="Plus" size={20} /> הודעה חדשה
        </button>
      )}
      {composing && <Composer onClose={() => setComposing(false)} onSend={(a) => {
        setList((l) => [{ ...a, id: newId(), author: `${profile.firstName} ${profile.lastName}`, createdAt: Date.now() }, ...l])
        setComposing(false)
      }} />}
    </div>
  )
}

function Composer({ onClose, onSend }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [important, setImportant] = useState(false)
  return (
    <Sheet title="הודעה חדשה לצוות" onClose={onClose}>
      <div className="space-y-3">
        <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="כותרת" />
        <textarea className={`${field} min-h-32`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="מה רוצים להגיד?" />
        <button type="button" onClick={() => setImportant(!important)} className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-navy-950">
          <Icon name="Pin" size={18} className="text-accent-500" />
          <span className="flex-1 text-right font-semibold">הודעה חשובה (נעוצה למעלה)</span>
          <span className={`flex h-7 w-12 items-center rounded-full p-1 transition ${important ? 'justify-start bg-accent-500' : 'justify-end bg-slate-300 dark:bg-white/20'}`}><span className="h-5 w-5 rounded-full bg-white shadow" /></span>
        </button>
        <button disabled={!title.trim()} onClick={() => onSend({ title: title.trim(), body: body.trim(), important })} className={primaryBtn}>פרסום</button>
      </div>
    </Sheet>
  )
}
