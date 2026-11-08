import { useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Onboarding from './pages/Onboarding'
import Placeholder from './pages/Placeholder'
import Announcements from './pages/Announcements'
import Contacts from './pages/Contacts'
import { loadProfile, saveProfile, clearProfile } from './data/profile'

export default function App() {
  const [profile, setProfile] = useState(loadProfile)
  const save = (p) => { saveProfile(p); setProfile(p) }

  if (!profile) return <Onboarding onDone={save} />

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home profile={profile} />} />
        <Route path="/announcements" element={<Announcements profile={profile} />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/events" element={<Placeholder title="אירועים" icon="CalendarDays" color="violet" stage={4} />} />
        <Route path="/speaker" element={<Placeholder title="רמקול" icon="Speaker" color="green" stage={5} />} />
        <Route path="/rooms" element={<Placeholder title="שיבוץ חדרים" icon="DoorOpen" color="teal" stage={6} />} />
        <Route path="/reports" element={<Placeholder title="דיווחים" icon="ClipboardList" color="orange" stage={7} />} />
        <Route path="/notifications" element={<Placeholder title="התראות" icon="Bell" color="blue" stage={8} back={false} />} />
        <Route path="/profile" element={<Profile profile={profile} onSave={save} onReset={() => { clearProfile(); setProfile(null) }} />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <BottomNav />
    </HashRouter>
  )
}
