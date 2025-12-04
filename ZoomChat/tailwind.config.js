/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          1: '#ffd6e0',
          2: '#ff9fbf',
        },
        sky: {
          1: '#cfe9ff',
          2: '#7fd3ff',
        },
      },
      backgroundImage: {
        'gradient-heartshare': 'linear-gradient(135deg, #ffd6e0, #cfe9ff)',
        'gradient-heartshare-hover': 'linear-gradient(135deg, #ff9fbf, #7fd3ff)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
