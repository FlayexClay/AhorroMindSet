/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts,scss}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },
      colors: {
        green: {
          primary: "#22c55e",
          dark:    "#16a34a",
          bright:  "#4ade80",
          glow:    "rgba(34,197,94,0.25)",
        },
        bg: {
            darknest: '#050f0a',
            dark:     '#0a1a0f',
            panel:    '#0d1f14',
            card:     '#101c17',
            input:    '#0e1c14',
        },
        panel: {
          left:  '#0b2015',
          deep:  '#071409',
        },
        border: {
          subtle: 'rgba(34,197,94,0.12)',
          input:  'rgba(34,197,94,0.2)',
          focus:  'rgba(34,197,94,0.5)',
        }
      },
      boxShadow: {
        'green-glow':  '0 0 40px rgba(34,197,94,0.15)',
        'green-btn':   '0 4px 24px rgba(34,197,94,0.4)',
        'green-btn-lg':'0 6px 32px rgba(34,197,94,0.5)',
        'green-ring':  '0 0 0 3px rgba(34,197,94,0.1)',
        'icon-glow':   '0 0 20px rgba(34,197,94,0.2)',
      },
      animation: {
        'fade-up':    'fadeInUp 0.6s ease both',
        'fade-up-1':  'fadeInUp 0.6s 0.1s ease both',
        'fade-up-2':  'fadeInUp 0.6s 0.2s ease both',
        'fade-in':    'fadeIn 0.3s ease',
        'orb':        'orb 12s ease-in-out infinite',
        'orb-slow':   'orb 16s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 4s ease-in-out infinite',
        'spin-fast':  'spin 0.7s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(34,197,94,0.2)' },
          '50%':       { boxShadow: '0 0 40px rgba(34,197,94,0.4)' },
        },
        orb: {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '33%':  { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%':  { transform: 'translate(-20px,15px) scale(0.97)' },
          '100%': { transform: 'translate(0,0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};