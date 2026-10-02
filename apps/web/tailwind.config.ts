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
        ink: 'var(--ink, #0E0E10)',
        paper: 'var(--paper, #F3EFE6)',
        signal: 'var(--signal, #FF5B2E)',
        phantom: 'var(--phantom, #B9B4FF)',
        moss: 'var(--moss, #1F3D2B)',
        bone: 'var(--bone, #E4DED0)',
        ash: 'var(--ash, #6B6B70)',
        review: 'var(--review, #F2B84B)',
        danger: 'var(--danger, #C2261B)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Anton', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0 var(--ink, #0E0E10)',
      },
    },
  },
  plugins: [],
};

export default config;
