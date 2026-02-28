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
                "primary": "#137fec",
                "primary-light": "#e0f2fe",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",

                // Keep surface colors for backward compatibility with components not yet migrated
                surface: {
                    dark: '#ffffff',
                    darker: '#f8fafc',
                    darkLighter: '#f1f5f9',
                    elevated: '#ffffff',
                    hover: '#f1f5f9',
                },
                text: {
                    primary: '#1a202c',
                    secondary: '#4a5568',
                    muted: '#a0aec0',
                },
                border: {
                    solid: '#e2e8f0',
                    hover: '#cbd5e0',
                },
                success: "#48bb78",
                warning: "#ed8936",
                error: "#f56565",
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Inter', 'sans-serif'],
                playfair: ['Playfair Display', 'serif'],
                mono: ['Space Mono', 'monospace'],
                body: ['Inter', 'sans-serif']
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "full": "9999px",
            },
            boxShadow: {
                glow: "0 0 15px rgba(19, 127, 236, 0.2)",
                "glow-hover": "0 0 25px rgba(19, 127, 236, 0.3)",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
