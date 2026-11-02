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
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#4361EE',
          600: '#3B5BFD',
          700: '#2D4DE0',
        },
        card: {
          completed: '#EBF3FF',
          completedText: '#2563EB',
          pending: '#FFF0F0',
          pendingText: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'floating': '0 8px 30px rgba(59, 91, 253, 0.35)',
        'modal': '0 20px 40px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
