/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "dark-surface": "#121212",
        "dark-high-emphasis": "rgba(255, 255, 255, 0.87)",
        "dark-med-emphasis": "rgba(255, 255, 255, 0.60)",
        "dark-disabled-emphasis": "rgba(255, 255, 255, 0.38)",
        usaco: {
          navy: "#001d4a",
          blue: "#113399",
          sidebarActiveLight: "#f7faff",
          sidebarActiveDark: "#16191f",
        },
        surface: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          800: "#1f2937",
          900: "#181c25",
          950: "#121212",
        },
        quant: {
          cyan: "#06b6d4",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#f43f5e",
          purple: "#a855f7",
          blue: "#2563eb",
        },
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        sans: [
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      gridTemplateColumns: {
        16: "repeat(16, minmax(0, 1fr))",
      },
    },
  },
  plugins: [],
};
