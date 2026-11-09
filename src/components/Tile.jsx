import { Link } from 'react-router-dom'
import Icon from './Icon'
import { tint, solid } from './colors'

// ריבוע צבעוני במסך הבית (שלושה בשורה, כדי שהכול ייכנס במסך אחד)
export default function Tile({ tile }) {
  return (
    <Link
      to={`/${tile.id}`}
      className={`relative flex flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[22px] bg-gradient-to-br px-1 py-3 text-center [@media(max-height:620px)]:gap-1 [@media(max-height:620px)]:py-2 shadow-card ring-1 ring-slate-900/5 transition active:scale-[.96] dark:ring-white/5 ${tint[tile.color]}`}
    >
      <div className={`grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md [@media(max-height:620px)]:h-10 [@media(max-height:620px)]:w-10 ${solid[tile.color]}`}>
        <Icon name={tile.icon} size={24} />
      </div>
      <div className="flex items-center gap-1 text-[14px] font-extrabold leading-tight">
        {tile.title}
        {tile.locked && <Icon name="Lock" size={11} className="text-slate-400" />}
      </div>
      {tile.sub && (
        <div className="flex max-w-full items-center gap-1 truncate px-1 text-[11px] leading-tight text-slate-500 dark:text-slate-400 [@media(max-height:620px)]:hidden">
          {tile.dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${{ green: 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-400' }[tile.dot]}`} />}
          <span className="truncate">{tile.sub}</span>
        </div>
      )}
      {tile.badge > 0 && (
        <span className="absolute left-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent-500 px-1 text-[11px] font-bold text-white shadow">
          {tile.badge}
        </span>
      )}
    </Link>
  )
}
