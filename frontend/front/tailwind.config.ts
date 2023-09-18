import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      height: {
        "95vh": "95vh",
        "90vh": "90vh",
        "80vh": "80vh",
        "80%": "80%",
        "30px": "30px",
        "inherit": "inherit",
      },
      minHeight: {
        "80vh": "80vh",
        "100" : "100px",
      },
      minWidth: {
        "100" : "100px",
      },
      maxWidth: {
        "max-w-screen": "100vw",
      },
      padding: {
        "2px" : "2px",
      },
      borderWidth: {
        "border-0.5" : "0.5px",
        "border-1" : "1px",
      },
      bottom: {
        "28px" : "28px",
      },
    },
  },
  plugins: [],
};
export default config;
