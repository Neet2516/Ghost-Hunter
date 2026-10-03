import type { Metadata } from 'next';
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import './globals.css';

const displayFont = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['700', '800'],
  display: 'swap',
});

const sansFont = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ghost-Hunter — Silence is data',
  description:
    'Temporal-powered, local-Gemma durable follow-up sentinel for job outreach. Zero cloud leakage, human-in-the-loop review gate, and fault-tolerant cadence state machine.',
  keywords: [
    'Temporal',
    'Ollama',
    'Gemma',
    'Job Search',
    'Outreach Sentinel',
    'Durable Execution',
    'Follow-up Agent',
  ],
  authors: [{ name: 'Ghost-Hunter Sentinel Team' }],
  openGraph: {
    title: 'Ghost-Hunter — Silence is data',
    description:
      'Durable, local-first follow-up agent for job and internship outreach.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Ghost-Hunter',
  },
};

export const viewport = {
  themeColor: '#0E0E10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink font-sans antialiased">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
