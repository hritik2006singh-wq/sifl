import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './content/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
   colors: {
    primary: "#0fbd49",
    "background-light": "#f6f8f6",
    "background-dark": "#102216",
  },
  fontFamily: {
    display: ["Public Sans", "sans-serif"],
  },
  borderRadius: {
    DEFAULT: "0.5rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
},
    },
    plugins: [],
};

export default config;
