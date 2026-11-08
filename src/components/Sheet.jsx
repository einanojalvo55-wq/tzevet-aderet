import Icon from './Icon'

// חלון שעולה מלמטה (לטפסים)
export default function Sheet({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="pb-safe page-in max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-navy-900">
        <div className="mb-4 flex items-center">
          <h2 className="flex-1 text-xl font-extrabold">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 dark:bg-white/10" aria-label="סגירה"><Icon name="X" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const field = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[16px] outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-500/20 dark:border-white/10 dark:bg-navy-950'
export const primaryBtn = 'w-full rounded-2xl bg-accent-500 py-3.5 text-lg font-bold text-white shadow-md transition active:scale-[.98] disabled:opacity-40'
