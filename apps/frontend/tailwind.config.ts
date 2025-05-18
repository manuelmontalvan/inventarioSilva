// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}", // opcional según tu estructura
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af", // Ejemplo de color personalizado
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("tailwind-scrollbar"), // opcional si lo usas
  ],
};

export default config;
