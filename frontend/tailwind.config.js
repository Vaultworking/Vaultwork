/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F1115',
        surface: '#1A1D23',
        surface2: '#242830',
        border: '#2D313A',
        text: '#E8E8E8',
        text2: '#A0A0A0',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
