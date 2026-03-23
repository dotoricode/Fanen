import type { Config } from 'tailwindcss';

/** TailwindCSS 설정 — 파낸 브랜드 컬러 및 Senior 모드 포함 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A56DB',
          50: '#EBF0FE',
          100: '#D6E0FD',
          200: '#ADC1FB',
          300: '#84A2F9',
          400: '#5B83F7',
          500: '#1A56DB',
          600: '#1545AF',
          700: '#103483',
          800: '#0B2358',
          900: '#05112C',
        },
        secondary: {
          DEFAULT: '#0E9F6E',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#0E9F6E',
          600: '#0B7F58',
          700: '#085F42',
          800: '#05402C',
          900: '#032016',
        },
        danger: {
          DEFAULT: '#E02424',
          50: '#FDF2F2',
          100: '#FDE8E8',
          200: '#FBD5D5',
          300: '#F8B4B4',
          400: '#F98080',
          500: '#E02424',
          600: '#C81E1E',
          700: '#9B1C1C',
          800: '#771D1D',
          900: '#5A1A1A',
        },
      },
      fontSize: {
        'senior-sm': '1rem',
        'senior-base': '1.25rem',
        'senior-lg': '1.5rem',
        'senior-xl': '1.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
