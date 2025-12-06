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
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#ffd6e0',
          300: '#ff9ad4',
          400: '#ff9ad4',
          500: '#ff6bb5',
          600: '#ec4899',
          700: '#db2777',
          800: '#be185d',
          900: '#831843',
        },
        sky: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#cfe9ff',
          300: '#7fd3ff',
          400: '#4f8aff',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#1e293b',
        },
      },
      backgroundImage: {
        'gradient-heartshare': 'linear-gradient(135deg, #ffd6e0, #cfe9ff)',
        'gradient-heartshare-hover': 'linear-gradient(135deg, #ff9fbf, #7fd3ff)',
        'gradient-heart': 'linear-gradient(120deg, #ff9ad4, #4f8aff)',
        'gradient-romantic': 'linear-gradient(to right, #ff9ad4, #ffd6e0)',
        'gradient-sky': 'linear-gradient(to right, #4f8aff, #7fd3ff)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'shimmer': 'shimmer 2s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1', 
            boxShadow: '0 0 20px rgba(79, 138, 255, 0.4)' 
          },
          '50%': { 
            opacity: '0.8', 
            boxShadow: '0 0 30px rgba(255, 154, 212, 0.6)' 
          },
        },
      },
    },
  },
  plugins: [],
}

