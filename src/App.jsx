import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
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
import { loadProfile, saveProfile, clearProfile } from './data/profile'
import { useEvents, useLoans, fullName, notify } from './data/hooks'
import { useStore } from './data/store'
import { eventTime } from './data/dates'

// בודק כל דקה: תזכורות לאירועים (יום ושעה לפני) ותזכורת להחזרת הרמקול.
// כשנחבר שרת, הבדיקה הזאת תרוץ בשרת ותשלח Push גם כשהאפליקציה סגורה.
function useReminders(profile) {
  const [events] = useEvents()
  const [loans] = useLoans()
  const [sent, setSent] = useStore('remindersSent', [])
  useEffect(() => {
    if (!profile) return
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

export default function App() {
  const [profile, setProfile] = useState(loadProfile)
  const save = (p) => { saveProfile(p); setProfile(p) }
  useReminders(profile)

  if (!profile) return <Onboarding onDone={save} />

  return (
    <HashRouter>
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
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav profile={profile} />
    </HashRouter>
  )
}
