/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ceylon-blue': '#1e40af',
        'ceylon-green': '#059669',
        'ceylon-orange': '#ea580c',
        'ceylon-purple': '#7c3aed',
        'ceylon-red': '#dc2626',
      }
    },
  },
  plugins: [],
} 