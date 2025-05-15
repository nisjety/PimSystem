import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Define standard border color
        border: "#e7e6e4", // Light border color
        "border-dark": "#322f3b", // Dark border color

        // Background and foreground
        background: "#f8f7f5", // Lighter cream background
        foreground: "#1d1d1f", // Dark text

        // Card colors
        card: "#ffffff", // Pure white cards
        "card-foreground": "#1d1d1f",

        // Muted colors
        muted: "#6e6e73",
        "muted-foreground": "#6e6e73",

        // Aubergine primary colors
        primary: {
          DEFAULT: "#7D2E68", // Deep aubergine
          foreground: "#ffffff",
          50: "#f8f6fa",
          100: "#f0e7f4",
          200: "#e2d3ea",
          300: "#cbb3dc",
          400: "#b38fce",
          500: "#9a6cbf",
          600: "#7D2E68", // Deep aubergine
          700: "#692757",
          800: "#5a2049",
          900: "#471938",
        },
        
        // Secondary color (lighter aubergine)
        secondary: {
          DEFAULT: "#B25D8F", // Lighter mauve-rose
          foreground: "#ffffff",
        },
        
        // Accent color
        accent: {
          DEFAULT: "#9a6cbf", // Medium aubergine
          foreground: "#ffffff",
        },
        
        // Semantic colors
        destructive: {
          DEFAULT: "#FF3B5C", // Red
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#5dc560", // Green
          foreground: "#ffffff",
        },
        warning: {
          DEFAULT: "#ff9a88", // Orange
          foreground: "#ffffff",
        },
        info: {
          DEFAULT: "#4f8ede", // Blue
          foreground: "#ffffff",
        },
        
        // Cream color palette
        cream: {
          50: "#faf9f7",
          100: "#f5f4f2",
          200: "#e7e6e4",
          300: "#d5d4d2",
          400: "#a5a4a2",
          500: "#8a8988",
          600: "#6e6d6b",
          700: "#515050",
          800: "#3a3939",
          900: "#1d1d1f",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-playfair)", "serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 6s ease-in-out infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "float-fast": "float 4s ease-in-out infinite",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgb(0 0 0 / 0.03)",
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        medium: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        large: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        card: "0 2px 8px 0 rgb(0 0 0 / 0.05)",
        glow: "0 2px 20px 0 rgb(125, 46, 104, 0.3)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "brand-gradient": "linear-gradient(to right, #7D2E68, #B25D8F)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;