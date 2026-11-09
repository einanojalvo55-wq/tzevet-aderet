import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useNotifications, useNotifSeen, useAdmin, isForMe } from '../data/hooks'
import { timeAgo } from '../data/dates'

const kindIcon = { announcement: 'Megaphone', important: 'Pin', event: 'CalendarDays', room: 'DoorOpen', speaker: 'Speaker', report: 'ClipboardList', refund: 'Receipt' }

export default function Notifications({ profile }) {
  const [list] = useNotifications()
  const [seen, setSeen] = useNotifSeen()
  const [isAdmin] = useAdmin()
  const [seenAtOpen] = useState(seen)
  const mine = list.filter((n) => n.kind !== 'test' && isForMe(n, profile, isAdmin))
  useEffect(() => { setSeen(Date.now()) }, [list.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <PageHeader title="התראות" back={false} />
      {mine.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center text-slate-400">
          <Icon name="Bell" size={40} /><p className="mt-3">אין התראות עדיין</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl bg-white shadow-card dark:divide-white/5 dark:bg-navy-900">
          {mine.map((n) => (
            <Link key={n.id} to={n.link || '/'} className={`flex items-start gap-3 px-4 py-3.5 active:bg-slate-50 dark:active:bg-white/5 ${n.createdAt > seenAtOpen ? 'bg-navy-50 dark:bg-white/5' : ''}`}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-navy-100 text-navy-700 dark:bg-white/10 dark:text-white"><Icon name={kindIcon[n.kind] || 'Bell'} size={18} /></div>
              <div className="min-w-0 flex-1"><div className="text-[15px] leading-snug">{n.text}</div><div className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</div></div>
              {n.createdAt > seenAtOpen && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent-500" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
