import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import Tile from '../components/Tile'
import Logo from '../components/Logo'
import NotifBanner from '../components/NotifBanner'
import { useAnnouncements, useReadIds, useAdmin, useEvents, useLoans, useBookings, useReports, sortAnnouncements, fullName } from '../data/hooks'
import { speakerStatus } from './Speaker'
import { DAYS } from '../data/seed'
import { todayISO, relDay, eventTime, toMin, parseISO } from '../data/dates'

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
  const [events] = useEvents()
  const [loans] = useLoans()
  const [bookings] = useBookings()
  const [reports] = useReports()

  const unread = list.filter((x) => !readIds.includes(x.id)).length
  const a = sortAnnouncements(list)[0]
  const next = events.filter((e) => e.date >= todayISO()).sort((x, y) => eventTime(x) - eventTime(y))[0]
  const sp = speakerStatus(loans)
  const today = new Date().getDay()
  const tISO = todayISO()
  // השיבוץ הקרוב של השבט שלי או שלי: קודם היום, אחר כך הימים הבאים
  const daysAway = (b) => (b.date ? Math.round((parseISO(b.date) - parseISO(tISO)) / 86400000) : (b.day - today + 7) % 7)
  const mine = bookings.filter((b) => (b.who === profile.tribe || b.by === fullName(profile)) && (!b.date || b.date >= tISO))
    .sort((x, y) => daysAway(x) - daysAway(y) || toMin(x.from) - toMin(y.from))[0]
  const openReports = reports.filter((r) => r.status !== 'done' && (isAdmin || r.by === fullName(profile))).length
  const pendingLoans = isAdmin ? loans.filter((l) => l.status === 'pending').length : 0

  const tiles = [
    { id: 'announcements', title: 'הודעות', icon: 'Megaphone', color: 'blue', badge: unread, sub: unread ? `${unread} לא נקראו` : 'הכול נקרא' },
    { id: 'events', title: 'אירועים', icon: 'CalendarDays', color: 'violet', sub: next ? `${next.title} · ${relDay(next.date)}` : 'אין אירועים קרובים' },
    { id: 'rooms', title: 'חדרים', icon: 'DoorOpen', color: 'teal', sub: mine ? `${mine.room} · ${daysAway(mine) === 0 ? 'היום' : daysAway(mine) === 1 ? 'מחר' : `יום ${DAYS[mine.date ? parseISO(mine.date).getDay() : mine.day]}`}` : 'הזמנת חדר פנוי' },
    { id: 'speaker', title: 'רמקול', icon: 'Speaker', color: 'green', sub: sp.label, dot: sp.color, badge: pendingLoans },
    { id: 'reports', title: 'דיווחים', icon: 'ClipboardList', color: 'orange', badge: openReports, sub: openReports ? `${openReports} פתוחים` : 'אין דיווחים פתוחים' },
    { id: 'contacts', title: 'מספרים חשובים', icon: 'Phone', color: 'rose', sub: 'לחיצה אחת ומתקשרים' },
    { id: 'links', title: 'קישורים חשובים', icon: 'Link', color: 'sky', sub: 'טפסים, אתרים ומסמכים' },
    { id: 'team', title: 'הצוות', icon: 'Users', color: 'violet', sub: 'כל המדריכים והטלפונים' },
    { id: 'admin', title: 'ניהול', icon: 'Settings', color: 'slate', sub: isAdmin ? 'מצב ניהול פעיל' : 'כניסה עם סיסמה', locked: !isAdmin, wide: true },
  ]

  return (
    <div className="page-in">
      <header className="pt-safe bg-gradient-to-b from-navy-800 to-navy-700 px-5 pb-16 text-white dark:from-navy-900 dark:to-navy-900">
        <div className="mx-auto flex max-w-md items-center justify-between pt-5">
          <div>
            <div className="text-sm text-navy-100/80">צוות אדרת</div>
            <h1 className="text-2xl font-extrabold">{greeting()}, {profile.firstName}</h1>
          </div>
          <Logo className="h-14 w-14 rounded-2xl shadow-lg ring-1 ring-white/20" />
        </div>
      </header>

      <main className="mx-auto -mt-11 max-w-md px-4 pb-28">
        <NotifBanner />
        {a && (
          <Link to="/announcements"
            className={`mb-4 flex items-start gap-3 rounded-3xl bg-white p-4 shadow-card transition active:scale-[.98] dark:bg-navy-900 ${!readIds.includes(a.id) ? 'ring-2 ring-accent-500' : 'ring-1 ring-slate-900/5 dark:ring-white/5'}`}>
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-accent-500 text-white"><Icon name="Megaphone" size={20} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-accent-600 dark:text-accent-400">
                הודעה אחרונה {a.important && <span className="rounded-full bg-accent-500/15 px-2 py-0.5">חשוב</span>}
              </div>
              <div className="mt-0.5 font-bold leading-snug">{a.title}</div>
              {a.body && <div className="mt-0.5 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">{a.body}</div>}
            </div>
          </Link>
        )}
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => <Tile key={t.id} tile={t} />)}
        </div>
      </main>
    </div>
  )
}
