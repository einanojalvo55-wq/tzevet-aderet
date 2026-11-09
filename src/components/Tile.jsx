import { Link } from 'react-router-dom'
import Icon from './Icon'
import { tone } from './colors'

// ריבוע לבן במסך הבית: שלושה בשורה, והגודל מתאים את עצמו למסך
export default function Tile({ tile }) {
  if (tile.wide) return (
    <Link to={`/${tile.id}`} className="col-span-3 flex items-center gap-3 rounded-2xl bg-white px-4 py-2.5 shadow-card ring-1 ring-slate-900/5 transition active:scale-[.98] dark:bg-navy-900 dark:ring-white/5">
      <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${tone[tile.color]}`}><Icon name={tile.icon} size={18} /></div>
      <div className="flex flex-1 items-center gap-1.5 font-bold">{tile.title}{tile.locked && <Icon name="Lock" size={12} className="text-slate-400" />}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">· {tile.sub}</span></div>
      <Icon name="ChevronLeft" size={18} className="text-slate-400" />
    </Link>
  )
  return (
    <Link
      to={`/${tile.id}`}
      className="relative flex flex-col items-center justify-center gap-2 rounded-3xl bg-white px-1 py-2 text-center shadow-card ring-1 ring-slate-900/5 transition active:scale-[.97] dark:bg-navy-900 dark:ring-white/5"
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl [@media(max-height:700px)]:h-10 [@media(max-height:700px)]:w-10 ${tone[tile.color]}`}>
        <Icon name={tile.icon} size={24} />
      </div>
      <div className="min-w-0 max-w-full">
        <div className="flex items-center justify-center gap-1 text-[15px] font-bold leading-tight">
          {tile.title}
          {tile.locked && <Icon name="Lock" size={12} className="text-slate-400" />}
        </div>
        <div className="mt-0.5 flex items-center justify-center gap-1 truncate px-1 text-[11.5px] text-slate-500 dark:text-slate-400 [@media(max-height:700px)]:hidden">
          {tile.dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${{ green: 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-400' }[tile.dot]}`} />}
          <span className="truncate">{tile.sub}</span>
        </div>
      </div>
      {tile.badge > 0 && (
        <span className="absolute left-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white">
          {tile.badge}
        </span>
      )}
    </Link>
  )
}
