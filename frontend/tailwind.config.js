/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#F4C542',
          yellowHover: '#E5B632',
          yellowLight: '#FFF8E8',
          yellowSoft: '#FFE8A3',
          dark: '#111111',
          body: '#3F3F3F',
          muted: '#777777',
          border: '#E8E1D2',
          borderLight: '#F5EFE3',
          cream: '#FFFDF7',
          creamSoft: '#FFF8E8',
          beige: '#F7F1E3',
        },
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#F4C542', // Warm Golden Yellow
          700: '#d97706',
          800: '#92400e',
          900: '#78350f',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
