/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neon: {
                    green: '#00ff00',
                    red: '#ff0000',
                    yellow: '#ffff00',
                },
            },
            fontFamily: {
                // Add custom fonts here if needed, consistent with "Industrial" feel
            },
        },
    },
    plugins: [],
}
