import icon from '../assets/app-icon.png'

// הלוגו של בני עקיבא אדרת, בלבן על רקע כחול
export default function Logo({ className = '' }) {
  return <img src={icon} alt="בני עקיבא אדרת" className={`object-cover ${className}`} />
}
