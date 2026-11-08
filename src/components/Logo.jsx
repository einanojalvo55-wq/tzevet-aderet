// הלוגו הזמני של צוות אדרת (יוחלף בלוגו סופי בשלב הליטוש)
export default function Logo({ className = '' }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-label="צוות אדרת">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2c5aa0" /><stop offset="1" stopColor="#0c1d38" /></linearGradient></defs>
      <rect width="512" height="512" rx="112" fill="url(#lg)" />
      <g fill="none" stroke="#fff" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="196" cy="214" r="54" /><circle cx="326" cy="214" r="54" />
        <path d="M110 372c10-52 48-82 86-82s76 30 86 82" /><path d="M240 372c10-52 48-82 86-82s76 30 86 82" />
      </g>
      <circle cx="404" cy="112" r="34" fill="#f59e0b" />
    </svg>
  )
}
