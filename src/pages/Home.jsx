import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Tile from '../components/Tile'
import Logo from '../components/Logo'
import { tiles } from '../data/mock'
import { useAnnouncements, useReadIds, useAdmin, sortAnnouncements } from '../data/hooks'

function greeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'בוקר טוב'
  if (h >= 12 && h < 17) return 'צהריים טובים'
  if (h >= 17 && h < 22) return 'ערב טוב'
  return 'לילה טוב'
}

export default function Home({ profile }) {
  const [list] = useAnnouncements()
  const [readIds] = useReadIds()
  const [isAdmin] = useAdmin()
  const unread = list.filter((x) => !readIds.includes(x.id)).length
  const a = sortAnnouncements(list)[0]
  const live = tiles.map((t) => {
    if (t.id === 'announcements') return { ...t, badge: unread, sub: unread ? `${unread} לא נקראו` : 'הכול נקרא' }
    if (t.id === 'rooms') return { ...t, sub: `${profile.tribe}: חדר גדול` }
    if (t.id === 'admin' && isAdmin) return { ...t, sub: 'מצב ניהול פעיל', locked: false }
    return t
  })
  return (
    <div className="page-in">
      <header className="pt-safe bg-gradient-to-b from-navy-800 to-navy-700 px-5 pb-16 text-white dark:from-navy-900 dark:to-navy-900">
        <div className="mx-auto flex max-w-md items-center justify-between pt-5">
          <div>
            <div className="text-sm text-navy-100/80">צוות אדרת</div>
            <h1 className="text-2xl font-extrabold">{greeting()}, {profile.firstName}</h1>
          </div>
          <Logo className="h-11 w-11 rounded-2xl shadow-lg ring-1 ring-white/20" />
        </div>
      </header>

      <main className="mx-auto -mt-11 max-w-md px-4 pb-28">
        {a && <Link to="/announcements"
          className={`mb-4 flex items-start gap-3 rounded-3xl bg-white p-4 shadow-card ring-1 transition active:scale-[.98] dark:bg-navy-900 ${!readIds.includes(a.id) ? 'ring-2 ring-accent-500' : 'ring-slate-900/5 dark:ring-white/5'}`}>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent-500 text-white">
            <Icon name="Megaphone" size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-600 dark:text-accent-400">
              הודעה אחרונה {a.important && <span className="rounded-full bg-accent-500/15 px-2 py-0.5">חשוב</span>}
            </div>
            <div className="mt-0.5 font-bold leading-snug">{a.title}</div>
            {a.body && <div className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{a.body}</div>}
          </div>
        </Link>}

        <div className="grid grid-cols-2 gap-3">
          {live.map((t) => <Tile key={t.id} tile={t} />)}
        </div>
      </main>
    </div>
  )
}
