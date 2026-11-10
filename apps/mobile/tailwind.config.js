/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#CBB3E8',
          dark: '#9678BD',
          light: '#E8DDF5',
          tint: '#F0EAF7',
        },
        accent: {
          DEFAULT: '#D4FF3F',
          dark: '#A7CE16',
          light: '#F4FFC2',
        },
        secondary: {
          DEFAULT: '#E34234',
          dark: '#B8281C',
          light: '#F8D8D4',
        },
        solace: {
          bg: '#F8F6FA',
          surface: '#FFFFFF',
          surfaceSecondary: '#F0EAF7',
          textPrimary: '#292431',
          textSecondary: '#716B78',
          textMuted: '#A39BA9',
          lavender: '#CBB3E8',
          lime: '#D4FF3F',
          red: '#E34234',
          peach: '#F5D5C6',
          mint: '#D2F0E0',
          butter: '#FDF1C7',
        },
      },
    },
  },
  plugins: [],
};
