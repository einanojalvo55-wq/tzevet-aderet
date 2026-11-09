import { useEffect, useState } from 'react'
import { loadImage } from '../firebase'

// תמונות שהעלינו מהטלפון הזה: מוצגות מיד, בלי לחכות לשרת
export const localImages = new Map()

// מציג תמונה ששמורה בשרת ("img:<id>") או ישירות (data:...)
export default function StoredImage({ src, className, onOpen }) {
  const isRef = src?.startsWith('img:')
  const [data, setData] = useState(isRef ? localImages.get(src) || null : src)
  useEffect(() => {
    if (!isRef || localImages.has(src)) return
    // התמונה אולי עוד עולה ברקע: מנסים שוב כמה פעמים
    let stop = false, tries = 0
    const tryLoad = () => loadImage(src.slice(4)).then((d) => {
      if (stop) return
      if (d) setData(d); else if (++tries < 8) setTimeout(tryLoad, 2500)
    }).catch(() => { if (!stop && ++tries < 8) setTimeout(tryLoad, 2500) })
    tryLoad()
    return () => { stop = true }
  }, [src, isRef])
  if (!data) return <div className={`${className} w-28 animate-pulse bg-slate-200 dark:bg-white/10`} />
  return <button onClick={() => onOpen?.(data)} className="block"><img src={data} alt="" className={className} /></button>
}
