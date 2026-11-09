import { createPortal } from 'react-dom'
import Icon from './Icon'

// צפייה בתמונה במסך מלא, עם כפתור "חזרה" ברור
export default function PhotoViewer({ src, onClose }) {
  if (!src) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="pt-safe flex items-center px-4 py-3">
        <button onClick={onClose} className="flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 font-bold text-white active:scale-95">
          <Icon name="ArrowRight" size={20} /> חזרה
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-auto p-3">
        <img src={src} alt="" className="max-h-full max-w-full rounded-xl object-contain" />
      </div>
    </div>,
    document.body,
  )
}
