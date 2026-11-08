import { Megaphone, CalendarDays, DoorOpen, Speaker, ClipboardList, Phone, Settings, Home, Bell, User, Lock, ChevronLeft, ChevronRight, ArrowRight, Construction, LogOut, Plus, Star, Trash2, Pencil, MessageCircle, X, Pin, ShieldCheck, Unlock, MapPin, Clock, Check, List, Calendar, History, Camera, AlertTriangle, Wrench, FileText, HelpCircle, Undo2, BellRing, Users, BarChart3, Image, Link, ExternalLink } from 'lucide-react'

const map = { Megaphone, CalendarDays, DoorOpen, Speaker, ClipboardList, Phone, Settings, Home, Bell, User, Lock, ChevronLeft, ChevronRight, ArrowRight, Construction, LogOut, Plus, Star, Trash2, Pencil, MessageCircle, X, Pin, ShieldCheck, Unlock, MapPin, Clock, Check, List, Calendar, History, Camera, AlertTriangle, Wrench, FileText, HelpCircle, Undo2, BellRing, Users, BarChart3, Image, Link, ExternalLink }

export default function Icon({ name, ...props }) {
  const C = map[name]
  return C ? <C strokeWidth={2} {...props} /> : null
}
