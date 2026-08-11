/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./blog/**/*.html",
    "./ai-pays-off/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#05080f",
          900: "#0a0f1c",
          800: "#111827"
        },
        emerald: {
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857"
        },
        gold: {
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#d4a017",
          600: "#b45309"
        },
        brand: {
          dark: "#05080f",
          card: "#0b1220",
          green: "#10b981",
          gold: "#fbbf24"
        }
      },
      fontFamily: {
        sans: ["Manrope", "Aptos", "system-ui", "sans-serif"]
      }
    }
  }
};
