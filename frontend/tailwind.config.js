import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  blocklist: [],
  content: {
    relative: true,
    files: ["./index.html", "./src/**/*.{js,jsx}"]
  },
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        "emergency-red": "hsl(var(--emergency-red))",
        "emergency-orange": "hsl(var(--emergency-orange))",
        "emergency-blue": "hsl(var(--emergency-blue))",
        "emergency-green": "hsl(var(--emergency-green))",
        danger: "#ef4444",
        warning: "#f59e0b",
        success: "#22c55e",
        info: "#3b82f6",
        "gradient-primary-from": "#f97316",
        "gradient-primary-to": "#ef4444"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  },
  plugins: [tailwindcssAnimate]
};
