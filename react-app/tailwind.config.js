/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                vivo: {
                    purple: '#660099',
                    dark: '#180024',
                    light: '#A85CFF',
                    pink: '#EC4899',
                    green: '#10B981',
                    orange: '#F59E0B'
                }
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            }
        },
    },
    plugins: [],
    darkMode: 'class', // or 'media' or 'class'
}
