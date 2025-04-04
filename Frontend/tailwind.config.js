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
          DEFAULT: "#3b82f6", // blue-500
          foreground: "#ffffff",
        },
        background: "#ffffff",
      },
      animation: {
        'rippling': 'ripple 600ms linear forwards',
      },
      keyframes: {
        ripple: {
          '0%': {
            transform: 'scale(0)',
            opacity: '0.5',
          },
          '100%': {
            transform: 'scale(4)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}

