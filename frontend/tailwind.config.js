/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Safelist grid column classes for dynamic sections
    'grid-cols-2',
    'grid-cols-3',
    'grid-cols-4',
    'grid-cols-6',
    'grid-cols-8',
    'md:grid-cols-2',
    'md:grid-cols-3',
    'md:grid-cols-4',
    'md:grid-cols-6',
    'md:grid-cols-8',
    'lg:grid-cols-2',
    'lg:grid-cols-3',
    'lg:grid-cols-4',
    'lg:grid-cols-6',
    'lg:grid-cols-8',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F57C00',
          dark: '#7B1FA2',
        },
        cream: '#FFF3E0',
      },
    },
  },
  plugins: [],
}

