export const todayISO = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10) }
export const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const fmtDate = (s) => parseISO(s).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
export const fmtShort = (s) => parseISO(s).toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
export const eventTime = (e) => parseISO(e.date).getTime() + (e.time ? (+e.time.slice(0, 2) * 60 + +e.time.slice(3)) * 60000 : 0)

export function relDay(s) {
  const diff = Math.round((parseISO(s) - parseISO(todayISO())) / 86400000)
  if (diff === 0) return 'היום'
  if (diff === 1) return 'מחר'
  if (diff > 1 && diff < 7) return `בעוד ${diff} ימים`
  return fmtShort(s)
}

export function timeAgo(ts) {
  const m = Math.round((Date.now() - ts) / 60000)
  if (m < 1) return 'עכשיו'
  if (m < 60) return `לפני ${m} דק׳`
  const h = Math.round(m / 60)
  if (h < 24) return `לפני ${h} שע׳`
  return new Date(ts).toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric' })
}

export const fmtDateTime = (ts) => new Date(ts).toLocaleString('he-IL', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
export const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3)
