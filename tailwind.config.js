/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Dòng này quét cả file .js và .jsx
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

