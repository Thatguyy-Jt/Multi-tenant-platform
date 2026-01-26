/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#14b8a6', // Teal 500
          hover: '#0d9488',   // Teal 600
          light: '#5eead4',   // Teal 300
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'clip-in': 'clipIn 1s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.8s ease-out both',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        clipIn: {
          '0%': { 
            clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
            transform: 'translateY(20px)',
            filter: 'blur(10px)',
          },
          '100%': { 
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            transform: 'translateY(0)',
            filter: 'blur(0)',
          },
        },
        fadeIn: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)',
            filter: 'blur(5px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
            filter: 'blur(0)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
