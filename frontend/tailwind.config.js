/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary clinical blue used across navigation, actions and headers
        clinical: {
          50: '#f1f6fc',
          100: '#dfeaf8',
          200: '#c0d6f0',
          300: '#93b8e4',
          400: '#5f94d4',
          500: '#3b74bd',
          600: '#2a5a9e',
          700: '#234a80',
          800: '#1d3c68',
          900: '#132a49',
        },
        // Neutral surfaces for the application chrome
        surface: {
          canvas: '#eef1f6',
          panel: '#ffffff',
          muted: '#f7f9fc',
          border: '#dde3ec',
          strong: '#c6cfdd',
        },
        // Restrained severity palette matching clinical reporting conventions
        severity: {
          critical: '#b42318',
          high: '#c4320a',
          moderate: '#b54708',
          low: '#175cd3',
          normal: '#067647',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)',
        raised: '0 4px 8px -2px rgba(16, 24, 40, 0.1), 0 2px 4px -2px rgba(16, 24, 40, 0.06)',
        overlay: '0 20px 24px -4px rgba(16, 24, 40, 0.12), 0 8px 8px -4px rgba(16, 24, 40, 0.04)',
      },
    },
  },
  plugins: [],
}
