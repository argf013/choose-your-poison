/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nordic: {
          bg: "#F7F5F0",
          surface: "#EFECE4",
          card: "#FFFFFF",
          border: "#E2DDD3",
          borderSubtle: "#ECE8DE",
          ink: "#1A1918",
          inkSecondary: "#42403B",
          muted: "#78756F",
          mutedLight: "#A6A39C",
          accent: "#D6552B", // Nordic terracotta / signal accent
          accentHover: "#C04921",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
        mono: [
          '"Space Mono"',
          '"Courier New"',
          "Courier",
          "monospace",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        soft: "0 8px 24px -4px rgba(26, 25, 24, 0.06)",
        receipt: "0 12px 32px -8px rgba(26, 25, 24, 0.08), 0 0 0 1px rgba(26, 25, 24, 0.04)",
      },
    },
  },
  plugins: [],
};
