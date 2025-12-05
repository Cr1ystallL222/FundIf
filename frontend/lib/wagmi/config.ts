// lib/wagmi/config.ts
import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    // 1. Force Smart Wallet as priority for the demo
    coinbaseWallet({
      appName: 'FundIf',
      preference: 'smartWalletOnly', // <--- CRITICAL: Forces the Gasless-compatible UI
    }),
    injected(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(), 
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}