/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FF3B10',
        surface: {
          DEFAULT: '#111111',
          card: '#222222',
          'card-hover': '#2A2A2A',
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
