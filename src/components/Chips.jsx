// שורת כפתורי בחירה (למשל: סוג אירוע, שבט, יום)
export default function Chips({ options, value, onChange, cols, small }) {
  return (
    <div className={cols ? 'grid gap-2' : 'flex flex-wrap gap-2'} style={cols ? { gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` } : undefined}>
      {options.map((o) => {
        const v = typeof o === 'string' ? o : o.value
        const l = typeof o === 'string' ? o : o.label
        return (
          <button type="button" key={v} onClick={() => onChange(v)}
            className={`rounded-2xl font-semibold transition active:scale-95 ${small ? 'px-3 py-2 text-sm' : 'px-4 py-2.5 text-[15px]'} ${value === v ? 'bg-navy-700 text-white shadow-md dark:bg-accent-500 dark:text-navy-950' : 'bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-300'}`}>
            {l}
          </button>
        )
      })}
    </div>
  )
}
