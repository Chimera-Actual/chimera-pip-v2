import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				/* Pip-Boy Color Extensions */
				'pip-bg': {
					primary: 'hsl(var(--pip-bg-primary))',
					secondary: 'hsl(var(--pip-bg-secondary))',
					tertiary: 'hsl(var(--pip-bg-tertiary))',
					overlay: 'hsl(var(--pip-bg-overlay))'
				},
				'pip-green': {
					DEFAULT: 'hsl(var(--pip-green-primary))',
					primary: 'hsl(var(--pip-green-primary))',
					secondary: 'hsl(var(--pip-green-secondary))',
					muted: 'hsl(var(--pip-green-muted))',
					glow: 'hsl(var(--pip-glow))'
				},
				'pip-text': {
					primary: 'hsl(var(--pip-text-primary))',
					secondary: 'hsl(var(--pip-text-secondary))',
					muted: 'hsl(var(--pip-text-muted))',
					bright: 'hsl(var(--pip-text-bright))'
				},
				'pip-border': {
					DEFAULT: 'hsl(var(--pip-border))',
					bright: 'hsl(var(--pip-border-bright))'
				}
			},
			spacing: {
				'pip-xs': '0.5rem',    // 8px
				'pip-sm': '1rem',      // 16px  
				'pip-md': '1.5rem',    // 24px
				'pip-lg': '2rem',      // 32px
				'pip-xl': '3rem',      // 48px
			},
			fontFamily: {
				'mono': ['var(--font-mono)'],
				'display': ['var(--font-display)'],
				'pip-display': ['Orbitron', 'Arial', 'sans-serif'],
				'pip-mono': ['Share Tech Mono', 'Courier New', 'monospace']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'pip-glow': 'var(--phosphor-glow)',
				'pip-text': 'var(--text-glow)',
				'pip-button': 'var(--button-glow)'
			},
      keyframes: {
        // Accordion animations
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" }
        },
        // Fade animations
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(10px)" }
        },
        // Scale animations
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "scale-out": {
          from: { transform: "scale(1)", opacity: "1" },
          to: { transform: "scale(0.95)", opacity: "0" }
        },
        // Slide animations
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        // Enhanced Pip-Boy animations
        'pip-boot': {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        'pip-flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'pip-scan': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        "pip-glow-pulse": {
          "0%": { 
            textShadow: "0 0 10px hsl(var(--pip-green-primary) / 0.5)",
            boxShadow: "0 0 20px hsl(var(--pip-green-primary) / 0.2)" 
          },
          "100%": { 
            textShadow: "0 0 20px hsl(var(--pip-green-primary) / 0.8)",
            boxShadow: "0 0 40px hsl(var(--pip-green-primary) / 0.4)" 
          }
        },
        "pip-data-scroll": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-100%)" }
        },
        "pip-static": {
          "0%, 100%": { opacity: "1" },
          "25%": { opacity: "0.8" },
          "50%": { opacity: "0.9" },
          "75%": { opacity: "0.7" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "scale-out": "scale-out 0.2s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        // Combined animations
        "enter": "fade-in 0.3s ease-out, scale-in 0.2s ease-out",
        "exit": "fade-out 0.3s ease-out, scale-out 0.2s ease-out",
        // Enhanced Pip-Boy animations
        'pip-boot': 'pip-boot 0.8s ease-out',
        'pip-flicker': 'pip-flicker 2s ease-in-out infinite',
        'pip-scan': 'pip-scan 3s linear infinite',
        "pip-glow": "pip-glow-pulse 2s ease-in-out infinite alternate",
        "pip-data": "pip-data-scroll 10s linear infinite",
        "pip-static": "pip-static 0.1s infinite"
      },
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
