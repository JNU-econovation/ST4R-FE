/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        shinier: ['Shinier', 'sans-serif'],
        pretendard: ['Pretendard', 'sans-serif'],
      },
      colors: {
        'star-yellow': '#FFBB02',
        'star-black': '#000000',
        'star-gray': '#8F8F8F',
        'star-dark': '#121212',
        'star-darker': '#101010',
      },
    },
  },
  plugins: [],
};
