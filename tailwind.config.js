/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

