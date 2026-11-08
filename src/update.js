/* global __BUILD__ */
// עדכון אוטומטי: באייפון, אפליקציה במסך הבית נשארת עם גרסה ישנה.
// כאן בודקים אם יש גרסה חדשה בשרת, ואם כן טוענים אותה מחדש.
async function check() {
  if (location.protocol === 'file:') return
  try {
    const r = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) return
    const { build } = await r.json()
    if (build && build !== __BUILD__) {
      // מונעים לולאה: מנסים לטעון כל גרסה חדשה רק פעם אחת
      const key = 'tzevet-aderet:reloadedFor'
      let last = null
      try { last = sessionStorage.getItem(key) } catch { /* */ }
      if (last === build) return
      try { sessionStorage.setItem(key, build) } catch { /* */ }
      location.reload()
    }
  } catch { /* אין אינטרנט, ננסה בפעם הבאה */ }
}

export function startAutoUpdate() {
  check()
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check() })
  setInterval(check, 5 * 60 * 1000)
}
