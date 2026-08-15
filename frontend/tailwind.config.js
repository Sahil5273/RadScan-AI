/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        medical: {
          dark: '#0a0d14',
          card: '#121722',
          border: '#1e2638',
          accent: '#00d2ff',
          teal: '#00f2fe',
          cyan: '#0a9396',
          warning: '#f77f00',
          danger: '#e63946',
          success: '#2a9d8f'
        }
      }
    },
  },
  plugins: [],
}
