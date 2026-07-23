/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        success: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
        danger:  { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        warning: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        surface: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#080e1c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },
      backgroundImage: {
        'grid-surface': `radial-gradient(circle at 1px 1px, rgba(6,182,212,0.08) 1px, transparent 0)`,
      },
      backgroundSize: { grid: '28px 28px' },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slideIn 0.25s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideIn: { from: { transform: 'translateX(-16px)', opacity: 0 }, to: { transform: 'translateX(0)', opacity: 1 } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    },
  },
  plugins: [],
};
