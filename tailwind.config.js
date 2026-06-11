/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── "Dual Personality" semantic tokens (Phase 14, RD-1) ──────────────
      // These read CSS variables from src/styles/tokens.css, so ONE utility
      // (e.g. `bg-surface`) renders cream in the Playground (light) and
      // deep-space navy in the Laboratory (dark) — no `dark:` pair needed.
      // The rgb(var() / <alpha-value>) wrapper keeps opacity modifiers
      // like `bg-surface/50` working (tokens store raw RGB triplets).
      fontFamily: {
        display: 'var(--font-display)',   // Archivo Black ☀ / Space Grotesk 🌙
        body: 'var(--font-body)',         // Space Grotesk in both
        labmono: 'var(--font-mono-accent)', // JetBrains Mono ("lab readout" voice)
      },
      borderRadius: {
        card: 'var(--radius-card)',       // 4px ☀ / 14px 🌙
        btn: 'var(--radius-btn)',         // 2px ☀ / 10px 🌙
      },
      boxShadow: {
        card: 'var(--shadow-card)',           // hard offset ☀ / soft glow 🌙
        'card-hover': 'var(--shadow-card-hover)',
        btn: 'var(--shadow-btn)',
        'btn-hover': 'var(--shadow-btn-hover)',
      },
      colors: {
        // Semantic, personality-aware colors (Phase 14)
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-muted': 'rgb(var(--c-ink-muted) / <alpha-value>)',
        accent: {
          brand: 'rgb(var(--c-accent-brand) / <alpha-value>)',
          cta: 'rgb(var(--c-accent-cta) / <alpha-value>)',
          finance: 'rgb(var(--c-accent-finance) / <alpha-value>)',
          trading: 'rgb(var(--c-accent-trading) / <alpha-value>)',
          tools: 'rgb(var(--c-accent-tools) / <alpha-value>)',
          cooking: 'rgb(var(--c-accent-cooking) / <alpha-value>)',
        },
        light: {
          background: '#FFFFFF',
          surface: '#F8F9FC',
          primary: '#6200EE',
          secondary: '#03DAC6',
          error: '#B00020',
          onBackground: '#1A1A1A',
          onSurface: '#1A1A1A',
          onPrimary: '#FFFFFF',
          onSecondary: '#000000',
          elevation: {
            1: '#FFFFFF',
            2: '#F5F5F5',
            3: '#F0F0F0',
            4: '#EBEBEB',
            6: '#E6E6E6',
            8: '#E1E1E1',
            12: '#DCDCDC',
            16: '#D7D7D7',
            24: '#D2D2D2'
          }
        },
        dark: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#BB86FC',
          secondary: '#03DAC6',
          error: '#CF6679',
          onBackground: '#FFFFFF',
          onSurface: '#FFFFFF',
          onPrimary: '#000000',
          onSecondary: '#000000',
          elevation: {
            1: '#1E1E1E',
            2: '#232323',
            3: '#252525',
            4: '#272727',
            6: '#2C2C2C',
            8: '#2E2E2E',
            12: '#333333',
            16: '#363636',
            24: '#383838'
          }
        }
      },
      backgroundColor: theme => ({
        ...theme('colors'),
      }),
      textColor: theme => ({
        ...theme('colors'),
      }),
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out'
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}