import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        poppins: ['var(--font-poppins)', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        primary: {
          DEFAULT: "#1a5d2e",
          light: "#2d7a47",
          lighter: "#4a9d63",
          dark: "#0f3a1c",
        },
        black: {
          DEFAULT: "#0a0a0a",
          pure: "#000000",
        },
        white: {
          DEFAULT: "#ffffff",
          soft: "#fafafa",
        },
        text: {
          DEFAULT: "#0a0a0a",
          secondary: "#4a4a4a",
          tertiary: "#8a8a8a",
          onDark: "#ffffff",
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
