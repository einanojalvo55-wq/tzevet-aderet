import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const tabs = [
  { to: '/', label: 'בית', icon: 'Home' },
  { to: '/events', label: 'אירועים', icon: 'CalendarDays' },
  { to: '/notifications', label: 'התראות', icon: 'Bell', badge: 3 },
  { to: '/profile', label: 'פרופיל', icon: 'User' },
]

export default function BottomNav() {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-navy-950/90">
      <div className="mx-auto grid max-w-md grid-cols-4 pt-2">
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to} end={t.to === '/'}
            className={({ isActive }) => `relative flex flex-col items-center gap-1 py-1 text-[11px] font-medium transition ${isActive ? 'text-navy-600 dark:text-accent-400' : 'text-slate-400'}`}>
            <span className="relative">
              <Icon name={t.icon} size={24} />
              {t.badge && <span className="absolute -left-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white dark:ring-navy-950" />}
            </span>
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
