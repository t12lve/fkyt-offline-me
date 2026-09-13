/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        psylocke: {
          darkest: '#07050d',
          bg: '#0b0914',
          surface: '#130e24',
          card: 'rgba(23, 16, 42, 0.7)',
          cardHover: 'rgba(32, 22, 58, 0.85)',
          border: 'rgba(168, 85, 247, 0.25)',
          borderHover: 'rgba(236, 72, 153, 0.5)',
          violet: '#a855f7',
          pink: '#ec4899',
          blade: '#c026d3',
          glow: '#d946ef',
          muted: '#9488b3',
          text: '#f3e8ff',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'psionic': '0 0 25px -5px rgba(236, 72, 153, 0.35), 0 0 15px -3px rgba(168, 85, 247, 0.3)',
        'psionic-lg': '0 0 40px -5px rgba(236, 72, 153, 0.5), 0 0 25px -3px rgba(192, 38, 211, 0.4)',
        'psionic-glow': '0 0 15px rgba(168, 85, 247, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'psionic-glow': 'glow 2.5s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(236, 72, 153, 0.6), inset 0 0 15px rgba(192, 38, 211, 0.4)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
