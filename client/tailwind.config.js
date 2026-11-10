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
          navy: '#10243A',
          navyDark: '#0B1726',
          navyLight: '#183654',
          blue: '#2563EB',
          blueHover: '#1D4ED8',
          blueLight: '#EFF6FF',
          bg: '#F7F9FC',
          text: '#202B3C',
          muted: '#64748B',
          border: '#E2E8F0',
          card: '#FFFFFF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(16, 36, 58, 0.06)',
        'card-hover': '0 12px 30px rgba(16, 36, 58, 0.12)',
        'elevated': '0 20px 40px rgba(16, 36, 58, 0.15)',
      }
    },
  },
  plugins: [],
}

