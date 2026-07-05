// ============================================
// InfinityDrive — Root Layout
// ============================================
// Configures fonts, metadata, session provider, and dark theme.

import type { Metadata } from 'next';
import { Libre_Baskerville, Lora, IBM_Plex_Mono } from 'next/font/google';
import { Providers } from '@/components/Providers';
import './globals.css';

const libreBaskerville = Libre_Baskerville({
  weight: ['400', '700'],
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const lora = Lora({
  variable: '--font-serif',
  subsets: ['latin'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'InfinityDrive — Smart Cloud Storage Manager',
  description:
    'Break free from Google Drive storage limits. Transfer files between accounts seamlessly with zero local bandwidth usage.',
  keywords: ['Google Drive', 'cloud storage', 'file transfer', 'storage management'],
  icons: {
    icon: '/logo-3d.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`
          ${libreBaskerville.variable}
          ${lora.variable}
          ${ibmPlexMono.variable}
          font-sans min-h-full
          bg-background text-text-primary
          antialiased overflow-x-hidden relative
        `}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
