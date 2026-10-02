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
        status: {
          waiting: 'var(--status-waiting, #B9B4FF)',
          generating: 'var(--status-generating, #FF5B2E)',
          review: 'var(--status-review, #F2B84B)',
          replied: 'var(--status-replied, #1F3D2B)',
          cancelled: 'var(--status-cancelled, #6B6B70)',
          failed: 'var(--status-failed, #C2261B)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Anton', 'sans-serif'],
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        hard: '4px 4px 0 var(--ink, #0E0E10)',
        'hard-lg': '8px 8px 0 var(--ink, #0E0E10)',
        'hard-signal': '4px 4px 0 var(--signal, #FF5B2E)',
        'hard-moss': '4px 4px 0 var(--moss, #1F3D2B)',
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.02em',
      },
    },
  },
  plugins: [],
};

export default config;
