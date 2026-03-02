/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        shield: {
          blue: '#1E3A8A', navy: '#0F172A', 
          gray: '#475569', success: '#10B981',
          warning: '#F59E0B', error: '#EF4444'
        }
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] }
    }
  },
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html'
  ]
};
