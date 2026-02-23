/** @type {import('tailwindcss').Config} */
module.exports = {
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
                /* ── Accent ── */
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
                "display": ["Public Sans", "sans-serif"],
                "mono": ["Space Mono", "monospace"],
                "barcode": ["'Libre Barcode 39 Text'", "cursive"],
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "2xl": "2.5rem",
                "full": "9999px",
            },
            boxShadow: {
                "glow": "0 0 15px rgba(102, 126, 234, 0.15)",
                "glow-hover": "0 0 25px rgba(102, 126, 234, 0.3)",
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
