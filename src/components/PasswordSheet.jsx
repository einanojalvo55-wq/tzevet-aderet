import { useState } from 'react'
import Sheet, { field, primaryBtn } from './Sheet'
import { ADMIN_PASSWORD } from '../data/seed'

// בקשת סיסמת מנהלים לפני פעולה רגישה (למשל אישור החזר כספי)
export default function PasswordSheet({ title = 'אישור עם סיסמה', onOk, onClose }) {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const submit = () => { if (pw.trim() === ADMIN_PASSWORD) onOk(); else { setErr(true); setPw('') } }
  return (
    <Sheet title={title} onClose={onClose}>
      <div className="space-y-3">
        <input autoFocus type="password" inputMode="numeric" className={`${field} text-center text-lg`} value={pw} placeholder="סיסמה"
          onChange={(e) => { setPw(e.target.value); setErr(false) }} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        {err && <p className="text-center text-sm font-medium text-rose-600">סיסמה שגויה</p>}
        <button disabled={!pw} onClick={submit} className={primaryBtn}>אישור</button>
      </div>
    </Sheet>
  )
}
