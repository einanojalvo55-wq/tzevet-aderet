// רץ ב-GitHub כל 5 דקות: יוצר תזכורות (יום ושעה לפני אירוע, החזרת רמקול)
// ושולח כל התראה שלא נשלחה מיד (גיבוי).
import { reminders, sendPending } from '../lib/push-core.mjs'

await reminders()
console.log('sent', await sendPending())
process.exit(0)
