/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Keep your existing primary scale and add DEFAULT + foreground
        primary: {
          DEFAULT: "#0ea5e9", // fallback used by shadcn tokens / utilities
          foreground: "#ffffff", // used for text/icons on primary backgrounds
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },

        // Shadcn / design-token style color entries your CSS expects
        border: "hsl(var(--border, 214 16% 92%))", // uses CSS var with fallback
        input: "hsl(var(--input, 210 16% 96%))",
        ring: "hsl(var(--ring, 215 20% 60%))",
        background: "hsl(var(--background, 0 0% 100%))",
        foreground: "hsl(var(--foreground, 210 10% 10%))",

        // if you want semantic secondary/neutral tokens, add them too (optional)
        secondary: {
          DEFAULT: "hsl(var(--secondary, 210 12% 94%))",
          foreground: "hsl(var(--secondary-foreground, 210 8% 14%))",
        },
      },

      animation: {
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        skeleton: "skeleton 1.5s ease-in-out infinite",
      },
      keyframes: {
        "slide-in": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        skeleton: {
          "0%": { backgroundColor: "rgba(156, 163, 175, 0.1)" },
          "50%": { backgroundColor: "rgba(156, 163, 175, 0.2)" },
          "100%": { backgroundColor: "rgba(156, 163, 175, 0.1)" },
        },
      },
    },
  },
  plugins: [],
};
