import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { useNotifications, useNotifSeen, useAdmin, isForMe } from '../data/hooks'

export default function BottomNav({ profile }) {
  const [list] = useNotifications()
  const [seen] = useNotifSeen()
  const [isAdmin] = useAdmin()
  const unseen = list.filter((n) => n.kind !== 'test' && n.createdAt > seen && isForMe(n, profile, isAdmin)).length
  const tabs = [
    { to: '/', label: 'בית', icon: 'Home' },
    { to: '/events', label: 'אירועים', icon: 'CalendarDays' },
    { to: '/notifications', label: 'התראות', icon: 'Bell', badge: unseen },
    { to: '/profile', label: 'פרופיל', icon: 'User' },
  ]
  return (
    <nav style={{ transform: 'translateZ(0)' }} className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-navy-950/90">
      <div className="mx-auto grid max-w-md grid-cols-4 pt-2">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => `relative flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${isActive ? 'text-navy-600 dark:text-accent-400' : 'text-slate-400'}`}>
            {({ isActive }) => (<>
            <span className={`relative grid h-8 w-14 place-items-center rounded-full transition ${isActive ? 'bg-navy-100 dark:bg-accent-500/15' : ''}`}>
              <Icon name={t.icon} size={22} />
              {t.badge > 0 && <span className="absolute left-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-navy-950">{t.badge}</span>}
            </span>
            {t.label}
            </>)}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
