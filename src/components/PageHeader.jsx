import { useNavigate } from 'react-router-dom'
import Icon from './Icon'

export default function PageHeader({ title, back = true, action }) {
  const nav = useNavigate()
  return (
    <header className="pt-safe sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-slate-50 px-4 py-3 dark:bg-navy-950">
      {back && (
        <button onClick={() => nav(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card active:scale-95 dark:bg-navy-900" aria-label="חזרה">
          <Icon name="ArrowRight" size={20} />
        </button>
      )}
      <h1 className="flex-1 text-2xl font-extrabold">{title}</h1>
      {action}
    </header>
  )
}
