import { useNavigate } from 'react-router-dom'
import Icon from '../components/Icon'
import { tone } from '../components/colors'

// מסך זמני לכל חלק שעוד לא נבנה. בכל שלב נחליף אחד מהם במסך אמיתי.
export default function Placeholder({ title, icon, color = 'blue', stage, back = true }) {
  const nav = useNavigate()
  return (
    <div className="page-in mx-auto max-w-md px-4 pb-28">
      <header className="pt-safe flex items-center gap-2 py-4">
        {back && (
          <button onClick={() => nav(-1)} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-card active:scale-95 dark:bg-navy-900" aria-label="חזרה">
            <Icon name="ArrowRight" size={20} />
          </button>
        )}
        <h1 className="text-2xl font-extrabold">{title}</h1>
      </header>
      <div className="mt-6 flex flex-col items-center rounded-3xl bg-white p-8 text-center shadow-card dark:bg-navy-900">
        <div className={`grid h-16 w-16 place-items-center rounded-3xl ${tone[color]}`}>
          <Icon name={icon} size={30} />
        </div>
        <div className="mt-4 text-lg font-bold">בבנייה</div>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">המסך הזה ייבנה בשלב {stage} של התוכנית.</p>
      </div>
    </div>
  )
}
