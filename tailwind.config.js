/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: { sans: ['"DM Sans"','system-ui','sans-serif'], display: ['"Outfit"','system-ui','sans-serif'], mono: ['"JetBrains Mono"','monospace'] },
      keyframes: { 'fade-in': { '0%': { opacity:'0', transform:'translateY(8px)' }, '100%': { opacity:'1', transform:'translateY(0)' } }, 'scale-in': { '0%': { opacity:'0', transform:'scale(0.95)' }, '100%': { opacity:'1', transform:'scale(1)' } }, 'slide-up': { '0%': { opacity:'0', transform:'translateY(100%)' }, '100%': { opacity:'1', transform:'translateY(0)' } } },
      animation: { 'fade-in': 'fade-in 0.3s ease-out', 'scale-in': 'scale-in 0.2s ease-out', 'slide-up': 'slide-up 0.4s ease-out' },
    },
  },
  plugins: [],
};
