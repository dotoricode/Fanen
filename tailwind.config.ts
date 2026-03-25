import type { Config } from 'tailwindcss';

/** TailwindCSS 설정 — BINAH 브랜드 컬러 및 Senior 모드 포함 */
const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ── shadcn 호환 시맨틱 토큰 (CSS 변수 연동) ── */
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',
        card: {
          DEFAULT: 'rgb(var(--card) / <alpha-value>)',
          foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
        },
        primary: {
          DEFAULT: '#0D9488',
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#0D9488',
          600: '#0F766E',
          700: '#115E59',
          800: '#134E4A',
          900: '#042F2E',
        },
        secondary: {
          DEFAULT: '#A3E635',
          50: '#F7FEE7',
          100: '#ECFCCB',
          200: '#D9F99D',
          300: '#BEF264',
          400: '#A3E635',
          500: '#84CC16',
          600: '#65A30D',
          700: '#4D7C0F',
          800: '#3F6212',
          900: '#365314',
        },
        bandi: {
          glow: '#FDE68A',
          body: '#FCD34D',
          lime: '#A3E635',
          aura: '#FEF3C7',
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
