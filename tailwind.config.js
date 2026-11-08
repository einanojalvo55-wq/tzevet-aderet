/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      fontFamily: { sans: ['Heebo', 'system-ui', 'sans-serif'] },
      colors: {
        navy: { 50: '#eef3fb', 100: '#d6e2f5', 500: '#2c5aa0', 600: '#1f4a8a', 700: '#183a6e', 800: '#122b52', 900: '#0c1d38', 950: '#081326' },
        accent: { 400: '#ffb547', 500: '#f59e0b', 600: '#d97706' },
      },
      boxShadow: { card: '0 1px 2px rgba(16,24,40,.04), 0 4px 16px rgba(16,24,40,.06)' },
    },
  },
  plugins: [],
}
