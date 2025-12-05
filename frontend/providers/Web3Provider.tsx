// frontend/providers/Web3Provider.tsx
'use client';

import { type ReactNode, useState } from 'react';
import { WagmiProvider, type State } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { baseSepolia } from 'wagmi/chains';
import { config } from '@/lib/wagmi/config';

import '@coinbase/onchainkit/styles.css';
import './onchainkit-overrides.css';

interface Web3ProviderProps {
  children: ReactNode;
  initialState?: State;
}

export function Web3Provider({ children, initialState }: Web3ProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
          config={{
            appearance: {
              name: 'FundIf',
              logo: undefined,
              mode: 'light',
              theme: 'base',
            },
          }}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}