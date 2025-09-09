// tailwind.config.js  (ESM)
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          primary: "#0071e3",
          black: "#111111",
          white: "#ffffff",
          grayLight: "#f5f5f7",
          gray: "#e5e5ea",
        },
      },
    },
  },
  plugins: [],
};