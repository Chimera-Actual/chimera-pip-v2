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
					glow: 'hsl(var(--pip-green-glow))'
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
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pip-boot': 'pip-boot 0.8s ease-out',
				'pip-flicker': 'pip-flicker 2s ease-in-out infinite',
				'pip-scan': 'pip-scan 3s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
