/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#2C3E50",
        secondary: "#1ABC9C",
        background: "#1A1A1A",
        text: "#ECF0F1",
        border: "#34495E",
        error: "#E74C3C",
        success: "#2ECC71",
        placeholder: "#BDC3C7",
        darkGreen: "#0A6847",
        inputText: "#34495E",
      },
    },
  },
  plugins: [],
}
