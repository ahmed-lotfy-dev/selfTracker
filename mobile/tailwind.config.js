/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/features/**/*.{js,jsx,ts,tsx}",
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
        'surface-elevated': "var(--color-surface-elevated)",
        card: "var(--color-card)",
        overlay: "var(--color-overlay)",
        text: "var(--color-text)",
        'text-secondary': "var(--color-text-secondary)",
        'text-muted': "var(--color-text-muted)",
        border: "var(--color-border)",
        error: "var(--color-error)",
        warning: "var(--color-warning)",
        success: "var(--color-success)",
        info: "var(--color-info)",
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
