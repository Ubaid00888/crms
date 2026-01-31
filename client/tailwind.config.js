/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Intelligence Agency Dark Theme
                'dark-bg': '#0a0e1a',
                'dark-surface': '#131827',
                'dark-elevated': '#1a1f35',
                'accent-blue': '#00d4ff',
                'accent-cyan': '#00ffff',
                'accent-purple': '#8b5cf6',
                'danger-red': '#ef4444',
                'warning-amber': '#f59e0b',
                'success-green': '#10b981',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['Fira Code', 'monospace'],
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
                },
            },
        },
    },
    plugins: [],
}
