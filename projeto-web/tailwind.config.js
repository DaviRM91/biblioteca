/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontSize: {
        'base': ['1.125rem', { lineHeight: '1.7' }], // 18px
        'lg': ['1.25rem', { lineHeight: '1.7' }],
        'xl': ['1.5rem', { lineHeight: '1.6' }],
        '2xl': ['1.875rem', { lineHeight: '1.5' }],
        '3xl': ['2.25rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
      },
      minHeight: {
        'touch': '48px',
      },
    },
  },
  plugins: [],
}