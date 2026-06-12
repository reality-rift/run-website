/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FF3B10',
        surface: {
          DEFAULT: 'rgb(var(--surface-rgb) / <alpha-value>)',
          card: 'var(--surface-card)',
          'card-hover': 'var(--surface-card-hover)',
        },
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '2rem',
        'card-inner': '1.5rem',
      },
      maxWidth: {
        content: '1400px',
      },
    },
  },
  plugins: [],
};
