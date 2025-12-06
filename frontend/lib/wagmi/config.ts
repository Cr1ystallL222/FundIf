// lib/wagmi/config.ts
import { http, createConfig, cookieStorage, createStorage } from 'wagmi';
import { baseSepolia, base } from 'wagmi/chains';
import { coinbaseWallet, injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    // Coinbase Smart Wallet - GASLESS via Paymaster
    coinbaseWallet({
      appName: 'FundIf',
      preference: 'smartWalletOnly',
    }),
    // MetaMask / other injected wallets - REQUIRES GAS
    injected({ target: 'metaMask' }),
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