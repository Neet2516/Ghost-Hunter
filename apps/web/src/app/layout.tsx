import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ghost-Hunter — Silence is data',
  description: 'Durable, local-first follow-up agent for job and internship outreach.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink">{children}</body>
    </html>
  );
}
