/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/components/features/**/*.{js,jsx,ts,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  presets: [require("uniwind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        secondary: "var(--color-secondary)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        card: "var(--color-card)",
        text: "var(--color-text)",
        border: "var(--color-border)",
        error: "var(--color-error)",
        success: "var(--color-success)",
        inputBackground: "var(--color-input-background)",
        inputText: "var(--color-input-text)",
        placeholder: "var(--color-placeholder)",
        socialGoogle: "var(--color-social-google)",
        socialGithub: "var(--color-social-github)",
        statPrimary: "var(--color-stat-primary)",
        statSecondary: "var(--color-stat-secondary)",
        statTertiary: "var(--color-stat-tertiary)",
        statQuaternary: "var(--color-stat-quaternary)",
      },
    },
  },
  plugins: [],
}
