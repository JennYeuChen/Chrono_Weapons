/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'vhs-scan': 'vhs-scan 5s linear infinite',
        'jitter': 'jitter 0.1s infinite',
        'crt-power-on': 'crt-power-on 0.7s cubic-bezier(0.19, 1, 0.22, 1) forwards',
      }
    },
  },
  plugins: [],
}
