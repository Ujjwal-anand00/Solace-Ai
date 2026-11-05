/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        solace: {
          bg: '#0F172A',
          card: '#1E293B',
          accent: '#38BDF8',
          calm: '#34D399',
          warmth: '#FBBF24',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
};
