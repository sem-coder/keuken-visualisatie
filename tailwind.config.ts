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
        'brand-blue': {
          50: '#e6f4fe',
          100: '#cce9fd',
          200: '#99d3fb',
          300: '#66bdf9',
          400: '#33a7f7',
          500: '#0186ec',
          600: '#016bc0',
          700: '#015094',
          800: '#013568',
          900: '#011a3c',
          950: '#000d1e',
          DEFAULT: '#0186ec',
        },
      },
    },
  },
  plugins: [],
};
export default config;
