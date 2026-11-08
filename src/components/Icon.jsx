import { Megaphone, CalendarDays, DoorOpen, Speaker, ClipboardList, Phone, Settings, Home, Bell, User, Lock, ChevronLeft, ArrowRight, Construction } from 'lucide-react'

const map = { Megaphone, CalendarDays, DoorOpen, Speaker, ClipboardList, Phone, Settings, Home, Bell, User, Lock, ChevronLeft, ArrowRight, Construction }

export default function Icon({ name, ...props }) {
  const C = map[name]
  return C ? <C strokeWidth={2} {...props} /> : null
}
