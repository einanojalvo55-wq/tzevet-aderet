import { Link } from 'react-router-dom'
import Icon from './Icon'
import { tint, solid } from './colors'

export default function Tile({ tile }) {
  return (
    <Link
      to={`/${tile.id}`}
      className={`relative flex gap-3 overflow-hidden rounded-[26px] bg-gradient-to-br p-4 shadow-card ring-1 ring-slate-900/5 transition active:scale-[.97] dark:ring-white/5 ${tint[tile.color]} ${tile.wide ? 'col-span-2 flex-row items-center' : 'min-h-[132px] flex-col'}`}
    >
      <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-md ${solid[tile.color]}`}>
        <Icon name={tile.icon} size={24} />
      </div>
      <div className="mt-auto min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[17px] font-extrabold leading-tight">
          {tile.title}
          {tile.locked && <Icon name="Lock" size={14} className="text-slate-400" />}
        </div>
        <div className="mt-1 flex items-center gap-1.5 truncate text-[13px] text-slate-500 dark:text-slate-400">
          {tile.dot && <span className={`h-2 w-2 shrink-0 rounded-full ${{ green: 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-400' }[tile.dot]}`} />}
          {tile.sub}
        </div>
      </div>
      {tile.badge > 0 && (
        <span className="absolute left-3 top-3 grid h-6 min-w-6 place-items-center rounded-full bg-accent-500 px-1.5 text-xs font-bold text-white shadow">
          {tile.badge}
        </span>
      )}
      {tile.wide && <Icon name="ChevronLeft" size={20} className="text-slate-400" />}
    </Link>
  )
}
