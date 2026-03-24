/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // Orange-500
          light: '#fb923c',
          dark: '#ea580c',
        },
        background: {
          light: '#ffffff',
          dark: '#0f172a', // Slate-950
        }
      }
    },
  },
  plugins: [],
}
