/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#FFD700',
        'dark-overlay': 'rgba(0, 0, 0, 0.7)',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
      },
      textShadow: {
        'default': '2px 2px 4px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        marquee: 'marquee var(--marquee-duration, 40s) linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-md': {
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-lg': {
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.7)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover'])
    }
  ],
};
