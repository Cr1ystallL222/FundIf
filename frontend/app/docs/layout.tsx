import { Header } from '@/components/layout/Header';
import { Web3Provider } from '@/providers/Web3Provider';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Web3Provider>
      <Header />
      <main className="min-h-screen flex flex-col antialiased pt-16">
        {children}
      </main>
    </Web3Provider>
  );
}