import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Keuken Visualisatie',
  description: 'Bekijk jouw favoriete kleur op je eigen keuken en vraag samples aan.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
