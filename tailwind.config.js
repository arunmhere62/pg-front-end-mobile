/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0969DA',      // GitHub blue
        secondary: '#1F883D',    // GitHub green
        danger: '#CF222E',       // GitHub red
        warning: '#BF8700',      // GitHub yellow
        dark: '#24292F',         // GitHub dark gray
        light: '#F6F8FA',        // GitHub light gray
        'github-canvas': '#FFFFFF',
        'github-border': '#D0D7DE',
      },
    },
  },
  plugins: [],
}
