import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#00304D", // main background — exact from design
          dark: "#001522",   // footer / darkest
          mid: "#00506E",    // cards / secondary
          deep: "#00243A",   // deep panels
        },
        teal: {
          DEFAULT: "#00B4AC", // brand accent — exact from design
          cyan: "#44C5CF",
        },
        iceblue: "#B4D4E5",  // light headings on navy
        steel: "#94AFBD",    // body text on navy
        gold: "#C06843",
      },
      fontFamily: {
        sans: ["GESSTwo", "Exo2", "system-ui", "sans-serif"],
        unique: ["GESSUnique", "GESSTwo", "sans-serif"],
        exo: ["Exo2", "sans-serif"],
      },
      maxWidth: {
        container: "1272px",
      },
    },
  },
  plugins: [],
};
export default config;
