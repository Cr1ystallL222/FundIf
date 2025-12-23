// frontend/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Header } from '@/components/layout/Header';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FundIf - Prediction-Gated Crowdfunding',
  description: 'A prediction-gated crowdfunding platform built on Base Sepolia. Create and fund campaigns with prediction markets.',
  keywords: ['crowdfunding', 'prediction markets', 'web3', 'Base', 'blockchain'],
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3Provider>
          <Header />
          <main className="min-h-screen flex flex-col antialiased pt-16">
            {children}
          </main>
          <ConditionalFooter />
        </Web3Provider>
      </body>
    </html>
  );
}