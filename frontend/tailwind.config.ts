import type { Config } from "tailwindcss";

const config: Config = {
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
        primary: '#256F5A', // Main dark green
        secondary: '#0F766E', // Teal
        accent: '#F59E0B', // Amber
        danger: '#EF4444', // Red
        
        // Retain the slate aliases for layout compatibility but make them clean Light Mode colors
        slate: {
          950: '#ffffff', // Background (White)
          900: '#f8fafc', // Cards/Panels
          800: '#e2e8f0', // Borders
          700: '#cbd5e1', 
          600: '#94a3b8', 
          500: '#0F766E', // Buttons
          400: '#256F5A', // Secondary text
          300: '#1e293b', 
          200: '#0f172a', 
          100: '#020617', // Main dark text
          50:  '#000000', 
        },
        white: '#ffffff', // Real white
        black: '#020617',
        teal: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#0F766E',
          600: '#0d635c',
        }
      },
    },
  },
  plugins: [],
};
export default config;
