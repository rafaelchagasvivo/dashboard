/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'vivo-roxo-escuro': '#1a0033',
                'vivo-roxo': '#380054',
                'vivo-lilas': '#BD4AFF',
                'vivo-menta': '#B2D682',
                'vivo-laranja': '#FF9900',
                'vivo-rosa': '#EB3C7D',
                'brand-600': '#5a3e8d',
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
