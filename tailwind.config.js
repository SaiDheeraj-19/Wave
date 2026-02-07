/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#7f13ec",
                "onyx-black": "#080808",
                "onyx-surface": "#121212",
                "onyx-accent": "#A855F7",
                "onyx-indigo": "#6366F1",
                "onyx-text": "#FFFFFF",
                "onyx-text-dim": "#A1A1AA"
            },
            fontFamily: {
                "display": ["Be Vietnam Pro", "sans-serif"],
                "sans": ["Inter", "sans-serif"]
            }
        },
    },
    plugins: [],
}
