import { useEffect, useState } from 'react'
import { loadImage } from '../firebase'

// מציג תמונה ששמורה בשרת ("img:<id>") או ישירות (data:...)
export default function StoredImage({ src, className, onOpen }) {
  const [data, setData] = useState(src?.startsWith('img:') ? null : src)
  useEffect(() => {
    if (src?.startsWith('img:')) loadImage(src.slice(4)).then(setData).catch(() => setData(null))
  }, [src])
  if (!data) return <div className={`${className} w-28 animate-pulse bg-slate-200 dark:bg-white/10`} />
  return <button onClick={() => onOpen?.(data)} className="block"><img src={data} alt="" className={className} /></button>
}
