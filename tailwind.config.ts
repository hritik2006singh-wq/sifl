import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
        './content/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: '#006400', // deep institutional green
                secondary: '#F5F5F5', // soft neutral light gray
            },
            borderRadius: {
                card: '16px',
                btn: '12px',
            },
            boxShadow: {
                card: '0 4px 6px rgba(0,0,0,0.1)',
            },
        },
    },
    plugins: [],
};

export default config;
