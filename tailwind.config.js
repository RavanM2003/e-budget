/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#edf2ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#91a7ff',
          400: '#748ffc',
          500: '#5c7cfa',
          600: '#4c6ef5',
          700: '#4263eb',
          800: '#3b5bdb',
          900: '#364fc7'
        }
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15, 23, 42, 0.45)'
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', 'sans-serif']
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.2, 0.8, 0.4, 1)'
      }
    }
  },
  plugins: []
};
