import { createPortal } from 'react-dom'
import Icon from './Icon'
export default function Fab({ onClick, label }) {
  return createPortal(
    <button onClick={onClick} className="fixed bottom-24 left-5 z-20 flex items-center gap-2 rounded-full bg-accent-500 px-5 py-3.5 font-bold text-white shadow-xl active:scale-95">
      <Icon name="Plus" size={20} /> {label}
    </button>,
    document.body,
  )
}
