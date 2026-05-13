/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { card: '#0c0c14', base: '#06060a', hover: '#12121f', border: '#1a1a2e' },
        brand: { blue: '#3b82f6', green: '#22c55e', purple: '#a855f7', orange: '#f97316', red: '#ef4444', cyan: '#06b6d4' },
      },
    },
  },
  plugins: [],
}
