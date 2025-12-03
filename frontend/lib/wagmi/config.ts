// frontend/lib/wagmi/config.ts
import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    // 1. Use 'injected' first for standard browser wallets (Metamask, Rabby)
    injected(),
    // 2. Coinbase Wallet
    coinbaseWallet({
      appName: 'FundIf',
      // REMOVE appLogoUrl entirely if you don't have one.
      // Passing 'undefined' explicitly can crash the underlying SDK.
      
      // Change preference to 'all' for debugging. 
      // 'smartWalletOnly' is strict and relies heavily on the script that is crashing.
      preference: 'all', 
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [baseSepolia.id]: http(),
  },
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}