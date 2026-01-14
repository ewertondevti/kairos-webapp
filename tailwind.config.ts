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
        sans: ['"Nunito"', "sans-serif"],
      },
      colors: {
        primary: "#00ff00",
        "primary-text": "#ffffff",
        content: "#1b1c1d",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
export default config;
