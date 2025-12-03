// frontend/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';
import { Header } from '@/components/layout/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FundIf - Prediction-Gated Crowdfunding',
  description: 'A prediction-gated crowdfunding platform built on Base Sepolia. Create and fund campaigns with prediction markets.',
  keywords: ['crowdfunding', 'prediction markets', 'web3', 'Base', 'blockchain'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Web3Provider>
          <Header />
          <main className="pt-16 min-h-screen bg-gray-50">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}