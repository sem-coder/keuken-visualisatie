import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Keuken Visualisatie Tool',
  description: 'Visualiseer keukenfronten in verschillende wrap-afwerkingen.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="nl">
      <body className={`${inter.className} antialiased text-slate-900`}>{children}</body>
    </html>
  );
}
