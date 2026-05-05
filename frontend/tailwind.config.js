/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#006591",
        "primary-light": "#0ea5e9",
        "surface": "#f8f9ff",
        "surface-low": "#eff4ff",
        "surface-card": "#ffffff",
        "on-surface": "#0b1c30",
        "on-surface-muted": "#3e4850",
        "outline": "#6e7881",
        "outline-subtle": "#bec8d2",
      },
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}

