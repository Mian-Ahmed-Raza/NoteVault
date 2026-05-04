/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          50:  '#f0f0f7',
          100: '#e1e1ef',
          200: '#c8c8e0',
          300: '#9999c5',
          400: '#6666a8',
          500: '#4a4a8a',
          600: '#3d3d75',
          700: '#2d2d5a',
          800: '#1e1e3f',
          900: '#0f0f20',
          950: '#07070f',
        },
        primary: {
          50:  '#f0f0ff',
          100: '#e0e0ff',
          200: '#c4c4ff',
          300: '#a3a3ff',
          400: '#7c7cff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // NOTE: animations/keyframes/shadows are defined in index.css
      // to avoid Tailwind @apply conflicts with custom values
    },
  },
  plugins: [],
};