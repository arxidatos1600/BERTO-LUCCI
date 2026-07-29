import type { Config } from "tailwindcss";

// Absolute, forward-slash content globs so Tailwind scans the right files even
// when the dev server's working directory isn't this project root. (Relative
// globs resolve against process.cwd(); backslashes are glob escape chars.)
const root = __dirname.replace(/\\/g, "/");

const config: Config = {
  darkMode: ["class"],
  content: [
    `${root}/app/**/*.{ts,tsx}`,
    `${root}/components/**/*.{ts,tsx}`,
    `${root}/lib/**/*.{ts,tsx}`,
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        // The `-el` faces sit directly after each brand face: the browser resolves
        // fallback per glyph, so Latin renders in the brand font and Greek (absent
        // from all three brand faces) renders in a real Greek face instead of an
        // arbitrary OS default. Generic families stay last as the true safety net.
        sans: ["var(--font-sans)", "var(--font-sans-el)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "var(--font-serif-el)", "Georgia", "serif"],
        display: [
          "var(--font-display)",
          "var(--font-display-el)",
          "var(--font-serif)",
          "var(--font-serif-el)",
          "Georgia",
          "serif",
        ],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      letterSpacing: {
        luxe: "0.18em",
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
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(28px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "blur-in": {
          from: { opacity: "0", filter: "blur(12px)", transform: "translateY(14px)" },
          to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        /* Slow cinematic pan/zoom for hero slides */
        kenburns: {
          "0%": { transform: "scale(1.06) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.16) translate3d(-1.5%,-2%,0)" },
        },
        /* Animated sweep for gold hairlines / shimmer accents */
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scroll-cue": {
          "0%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "50%": { transform: "translateY(7px)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 1s ease-out both",
        "rise-in": "rise-in 0.9s cubic-bezier(0.22,1,0.36,1) both",
        "blur-in": "blur-in 1.1s cubic-bezier(0.22,1,0.36,1) both",
        kenburns: "kenburns 7s ease-out both",
        shimmer: "shimmer 6s linear infinite",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
