import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import Announcements from './pages/Announcements'
import Contacts from './pages/Contacts'
import Events from './pages/Events'
import Speaker from './pages/Speaker'
import Rooms from './pages/Rooms'
import Reports from './pages/Reports'
import Notifications from './pages/Notifications'
import Team from './pages/Team'
import Links from './pages/Links'
import Refunds from './pages/Refunds'
import { online, watchMyUser, saveUser } from './firebase'
import { loadProfile, saveProfile, clearProfile } from './data/profile'
import { useEvents, useLoans, useAdmin, fullName, notify } from './data/hooks'
import { KOMUNARIT } from './data/seed'
import { useStore } from './data/store'
import { eventTime } from './data/dates'

// בודק כל דקה: תזכורות לאירועים (יום ושעה לפני) ותזכורת להחזרת הרמקול.
// כשנחבר שרת, הבדיקה הזאת תרוץ בשרת ותשלח Push גם כשהאפליקציה סגורה.
function useReminders(profile) {
  const [events] = useEvents()
  const [loans] = useLoans()
  const [sent, setSent] = useStore('remindersSent', [])
  useEffect(() => {
    if (!profile || online) return // עם שרת, התזכורות נשלחות מהשרת
    const me = fullName(profile)
    const check = () => {
      const now = Date.now(), add = []
      for (const e of events) {
        if (e.rsvp?.[me] === 'no') continue
        const t = eventTime(e)
        for (const [ms, label] of [[86400000, 'מחר'], [3600000, 'בעוד שעה']]) {
          const key = `${e.id}:${ms}`
          if (t - now > 0 && t - now <= ms && !sent.includes(key)) { add.push(key); notify({ text: `תזכורת: ${e.title} ${label}${e.time ? ` (${e.time})` : ''}`, kind: 'event', to: me, link: '/events' }) }
        }
      }
      for (const l of loans.filter((x) => x.status === 'active' && x.user === me)) {
        const k1 = `${l.id}:due`, k2 = `${l.id}:late`
        if (now >= l.to - 1800000 && !sent.includes(k1)) { add.push(k1); notify({ text: 'עוד מעט צריך להחזיר את הרמקול לסניף', kind: 'speaker', to: me, link: '/speaker' }) }
        if (now > l.to + 1800000 && !sent.includes(k2)) { add.push(k2); notify({ text: `איחור בהחזרת הרמקול: ${me}`, kind: 'speaker', to: 'admins', link: '/speaker' }) }
      }
      if (add.length) setSent((s) => [...s, ...add].slice(-300))
    }
    check()
    const id = setInterval(check, 60000)
    return () => clearInterval(id)
  }, [events, loans, profile, sent]) // eslint-disable-line react-hooks/exhaustive-deps
}

// כל מעבר מסך מתחיל מלמעלה (בלי זה המסך החדש נפתח באמצע)
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  const [profile, setProfile] = useState(loadProfile)
  const save = (p) => { saveProfile(p); setProfile(p) }
  const [isAdmin, setAdmin] = useAdmin()
  // קומונרית (או מי שנרשם כמנהל) היא תמיד מנהלת
  const alwaysAdmin = profile?.tribe === KOMUNARIT || profile?.role === 'admin'
  useEffect(() => {
    if (alwaysAdmin && !isAdmin) { setAdmin(true); saveUser({ isAdmin: true }).catch(() => {}) }
  }, [alwaysAdmin, isAdmin]) // eslint-disable-line react-hooks/exhaustive-deps
  useReminders(profile)

  // מי שנרשם לפני שהוספנו טלפון מתבקש להשלים אותו
  // הפרופיל בשרת הוא הקובע לגבי השבט (מנהל יכול לשנות אותו).
  // אם אין עדיין פרופיל בשרת, שומרים אותו שם.
  useEffect(() => {
    if (!online || !profile?.phone) return
    return watchMyUser((d) => {
      if (!d || !d.firstName) { saveProfile(profile); return }
      if (d.tribe && d.tribe !== profile.tribe) save({ ...profile, tribe: d.tribe })
    })
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!profile || !profile.phone) return <Onboarding initial={profile || undefined} onDone={save} />

  return (
    <HashRouter>
      <ScrollToTop />
      {/* רקע כחול מאחורי שורת השעון של האייפון, כדי שהשעון ייראה ושום תוכן לא יגלוש מתחתיו */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 bg-navy-800 dark:bg-navy-950" style={{ height: 'env(safe-area-inset-top)' }} />
      <Routes>
        <Route path="/" element={<Home profile={profile} />} />
        <Route path="/announcements" element={<Announcements profile={profile} />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/events" element={<Events profile={profile} />} />
        <Route path="/speaker" element={<Speaker profile={profile} />} />
        <Route path="/rooms" element={<Rooms profile={profile} />} />
        <Route path="/reports" element={<Reports profile={profile} />} />
        <Route path="/notifications" element={<Notifications profile={profile} />} />
        <Route path="/profile" element={<Profile profile={profile} onSave={save} onReset={() => { clearProfile(); setProfile(null) }} />} />
        <Route path="/admin" element={<Admin alwaysAdmin={alwaysAdmin} />} />
        <Route path="/links" element={<Links />} />
        <Route path="/refunds" element={<Refunds profile={profile} />} />
        <Route path="/team" element={<Team profile={profile} />} />
      </Routes>
      <BottomNav profile={profile} />
    </HashRouter>
  )
}
