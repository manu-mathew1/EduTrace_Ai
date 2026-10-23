/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        linear: {
          bg: '#08090a',
          surface: '#0d0e11',
          panel: '#121316',
          'panel-hover': '#181a1f',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-subtle': 'rgba(255, 255, 255, 0.04)',
          'border-focus': 'rgba(255, 255, 255, 0.16)',
          primary: '#5E6AD2',
          'primary-hover': '#6F7CE8',
          'primary-subtle': 'rgba(94, 106, 210, 0.12)',
          text: '#F7F8F8',
          'text-muted': '#8A8F98',
          'text-dim': '#5B6069',
          emerald: '#27C57E',
          'emerald-subtle': 'rgba(39, 197, 126, 0.12)',
          amber: '#E59934',
          'amber-subtle': 'rgba(229, 153, 52, 0.12)',
          rose: '#EB5757',
          'rose-subtle': 'rgba(235, 87, 87, 0.12)',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#5E6AD2',
          600: '#4f5ac4',
          700: '#4338ca',
          900: '#1e1e38',
        },
        slate: {
          850: '#111215',
          900: '#0d0e11',
          950: '#08090a',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'linear-card': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 2px 8px rgba(0, 0, 0, 0.4)',
        'linear-glow': '0 0 30px -5px rgba(94, 106, 210, 0.25)',
      }
    },
  },
  plugins: [],
}
