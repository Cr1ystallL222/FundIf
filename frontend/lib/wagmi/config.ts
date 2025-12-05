// lib/wagmi/config.ts
import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia, base], // Both chains needed
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'FundIf',
      preference: 'all',
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http('https://mainnet.base.org'), // Explicit RPC for Base mainnet
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}