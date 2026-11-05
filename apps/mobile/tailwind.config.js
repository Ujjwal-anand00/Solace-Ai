/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#829B83',
          dark: '#536B58',
          light: '#AFC5B0',
          tint: '#E8EFE8',
        },
        solace: {
          bg: '#F8F6EF',
          surface: '#FFFFFF',
          surfaceSecondary: '#F0F1E9',
          textPrimary: '#303A34',
          textSecondary: '#737D75',
          textMuted: '#A0A79F',
          lavender: '#E9E2F5',
          peach: '#F5DFD2',
          mint: '#DCE9DD',
          butter: '#F5EDCF',
        },
      },
    },
  },
  plugins: [],
};
