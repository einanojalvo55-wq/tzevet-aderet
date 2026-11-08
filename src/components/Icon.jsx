import { Megaphone, CalendarDays, DoorOpen, Speaker, ClipboardList, Phone, Settings, Home, Bell, User, Lock, ChevronLeft, ArrowRight, Construction, LogOut } from 'lucide-react'

const map = { Megaphone, CalendarDays, DoorOpen, Speaker, ClipboardList, Phone, Settings, Home, Bell, User, Lock, ChevronLeft, ArrowRight, Construction, LogOut }

export default function Icon({ name, ...props }) {
  const C = map[name]
  return C ? <C strokeWidth={2} {...props} /> : null
}
