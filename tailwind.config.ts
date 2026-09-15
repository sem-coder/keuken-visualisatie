import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'brand-green': {
          50: '#ecfdf3',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#27c97a',
          600: '#22b569',
          700: '#1d9f59',
          800: '#187f48',
          900: '#145c36',
          950: '#0a3d23',
        },
        'brand-blue': {
          DEFAULT: '#0186ec',
          light: '#e6f4fe',
        },
      },
    },
  },
  plugins: [],
};
export default config;
