module.exports = {
    darkMode: "class",
    content: [
        './index.html',
        './index.tsx',
        './App.tsx',
        './components/**/*.{ts,tsx}',
        './hooks/**/*.{ts,tsx}',
        './context/**/*.{ts,tsx}',
        './services/**/*.{ts,tsx}',
        './types.ts',
        './constants.ts',
    ],
    theme: {
        extend: {
            colors: {
                // Dark Luxury Theme Colors
                primary: {
                    DEFAULT: '#38e07b',
                    hover: '#2bc968'
                },
                bronze: {
                    DEFAULT: '#cd7f32',
                    accent: '#C5A059',
                    dark: '#8C7335'
                },
                background: {
                    light: '#f6f8f7',
                    dark: '#122017'
                },
                surface: {
                    dark: '#1a261e',
                    darker: '#0d1410',
                    darkLighter: '#223026'
                },
                border: {
                    dark: '#2a3830'
                },
                card: {
                    light: '#FFFFFF',
                    dark: '#27272A'
                },
                text: {
                    dark: '#111827',
                    light: '#F9FAFB',
                    muted: '#9eb7a8',
                    secondary: '#9eb7a8'
                },
                input: {
                    borderLight: '#E5E7EB',
                    borderDark: '#3F3F46'
                },
                // Legacy Pastel Theme Colors (Retained for graceful migration)
                brand: {
                    50: '#f0f9ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    500: '#667eea',
                    600: '#5a67d8',
                    700: '#4c51bf',
                },
                "primary": "#667eea",
                "primary-50": "#eef2ff",
                "primary-100": "#e0e7ff",
                "primary-200": "#c7d2fe",
                "primary-500": "#667eea",
                "primary-600": "#5a67d8",
                "primary-700": "#4c51bf",
                "secondary": "#764ba2",
                "secondary-500": "#764ba2",
                "secondary-600": "#6b46c1",

                /* ── Backgrounds ── */
                "background-light": "#f8fafc",
                "background-dark": "#f8fafc",

                /* ── Surfaces ── */
                "surface-dark": "#ffffff",
                "surface-darker": "#f8fafc",
                "surface-highlight": "#f1f5f9",
                "surface-card": "rgba(255, 255, 255, 0.8)",
                "surface-elevated": "#f8fafc",
                "surface-hover": "#f1f5f9",

                /* ── Text ── */
                "text-primary": "#1a202c",
                "text-secondary": "#4a5568",
                "text-muted": "#a0aec0",

                /* ── Borders ── */
                "border-dark": "#e2e8f0",
                "border-glass": "rgba(148, 163, 184, 0.5)",
                "border-solid": "#e2e8f0",
                "border-hover": "#cbd5e0",

                /* ── Status ── */
                "success": "#48bb78",
                "warning": "#ed8936",
                "error": "#f56565",

                /* ── Legacy compat ── */
                "bronze": "#667eea",
                "bronze-light": "#c7d2fe",
                "bronze-dark": "#4c51bf",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Public Sans', 'sans-serif'],
                playfair: ['Playfair Display', 'serif'],
                mono: ['Space Mono', 'monospace'],
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "2xl": "2.5rem",
                "full": "9999px",
                'glass': '0.75rem',
            },
            boxShadow: {
                glow: "0 0 15px rgba(56, 224, 123, 0.2)",
                "glow-hover": "0 0 25px rgba(56, 224, 123, 0.3)",
                glass: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                "pastel": "0 25px 50px -12px rgba(0, 0, 0, 0.05)",
                "card": "0 10px 40px -10px rgba(100, 116, 139, 0.12)",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
