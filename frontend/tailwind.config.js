/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        ambercore: {
          300: "#ffd78a",
          400: "#ffbd55",
          500: "#f59e2e",
          600: "#d87916",
        },
      },
    },
  },

  plugins: [],
};