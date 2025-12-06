'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================
   ICONS
   ============================================ */

const Icons = {
  MetaMask: () => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <path d="M36.08 3.36L22.4 13.52l2.56-6.04L36.08 3.36z" fill="#E2761B"/>
      <path d="M3.92 3.36L17.48 13.6l-2.44-6.12L3.92 3.36z" fill="#E4761B"/>
      <path d="M31.04 27.28l-3.68 5.64 7.88 2.16 2.28-7.68-6.48-.12z" fill="#E4761B"/>
      <path d="M2.52 27.4l2.24 7.68 7.88-2.16-3.68-5.64-6.44.12z" fill="#E4761B"/>
      <path d="M12.16 17.44l-2.2 3.32 7.84.36-.28-8.44-5.36 4.76z" fill="#E4761B"/>
      <path d="M27.84 17.44l-5.44-4.84-.2 8.52 7.84-.36-2.2-3.32z" fill="#E4761B"/>
      <path d="M12.64 32.92l4.72-2.32-4.08-3.16-.64 5.48z" fill="#E4761B"/>
      <path d="M22.64 30.6l4.72 2.32-.64-5.48-4.08 3.16z" fill="#E4761B"/>
      <path d="M27.36 32.92l-4.72-2.32.36 3.04-.04 1.28 4.4-2z" fill="#D7C1B3"/>
      <path d="M12.64 32.92l4.4 2-.04-1.28.36-3.04-4.72 2.32z" fill="#D7C1B3"/>
      <path d="M17.12 25.24l-3.92-1.16 2.76-1.28 1.16 2.44z" fill="#233447"/>
      <path d="M22.88 25.24l1.16-2.44 2.8 1.28-3.96 1.16z" fill="#233447"/>
      <path d="M12.64 32.92l.68-5.64-4.36.12 3.68 5.52z" fill="#CD6116"/>
      <path d="M26.68 27.28l.68 5.64 3.68-5.52-4.36-.12z" fill="#CD6116"/>
      <path d="M30.04 20.76l-7.84.36.72 4.12 1.16-2.44 2.8 1.28 3.16-3.32z" fill="#CD6116"/>
      <path d="M13.2 24.08l2.8-1.28 1.16 2.44.72-4.12-7.84-.36 3.16 3.32z" fill="#CD6116"/>
      <path d="M9.96 20.76l3.28 6.4-.12-3.08-3.16-3.32z" fill="#E4751F"/>
      <path d="M26.88 24.08l-.12 3.08 3.28-6.4-3.16 3.32z" fill="#E4751F"/>
      <path d="M17.8 21.12l-.72 4.12.92 4.72.2-6.24-.4-2.6z" fill="#E4751F"/>
      <path d="M22.2 21.12l-.4 2.56.2 6.28.92-4.72-.72-4.12z" fill="#E4751F"/>
      <path d="M22.92 25.24l-.92 4.72.68.48 4.08-3.16.12-3.08-3.96 1.04z" fill="#F6851B"/>
      <path d="M13.2 24.08l.12 3.08 4.08 3.16.68-.48-.92-4.72-3.96-1.04z" fill="#F6851B"/>
      <path d="M23 35.88l.04-1.28-.36-.28h-5.36l-.36.28.04 1.28-4.4-2 1.56 1.28 3.12 2.16h5.44l3.12-2.16 1.56-1.28-4.4 2z" fill="#C0AD9E"/>
      <path d="M22.64 30.6l-.68-.48h-3.92l-.68.48-.36 3.04.36-.28h5.36l.36.28-.44-3.04z" fill="#161616"/>
      <path d="M36.72 14.32l1.2-5.68L36.08 3.36 22.64 13.2l5.2 4.24 7.36 2.12 1.6-1.88-.72-.48 1.12-1.04-.84-.64 1.12-.84-.76-.56z" fill="#763D16"/>
      <path d="M2.08 8.64l1.2 5.68-.76.56 1.12.84-.84.64 1.12 1.04-.72.48 1.6 1.88 7.36-2.12 5.2-4.24L3.92 3.36 2.08 8.64z" fill="#763D16"/>
      <path d="M35.2 19.56l-7.36-2.12 2.2 3.32-3.28 6.4 4.32-.04h6.48l-2.36-7.56z" fill="#F6851B"/>
      <path d="M12.16 17.44l-7.36 2.12-2.28 7.56h6.44l4.32.04-3.28-6.4 2.16-3.32z" fill="#F6851B"/>
      <path d="M22.2 21.12l.44-8.12 2.16-5.52h-9.52l2.12 5.52.48 8.12.16 2.6.04 6.24h3.92l.04-6.24.16-2.6z" fill="#F6851B"/>
    </svg>
  ),
  Coinbase: () => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="20" fill="#0052FF"/>
      <path d="M20 6C12.28 6 6 12.28 6 20s6.28 14 14 14 14-6.28 14-14S27.72 6 20 6zm0 22.4c-4.64 0-8.4-3.76-8.4-8.4s3.76-8.4 8.4-8.4 8.4 3.76 8.4 8.4-3.76 8.4-8.4 8.4z" fill="white"/>
      <circle cx="20" cy="20" r="5" fill="white"/>
    </svg>
  ),
  Wallet: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
    </svg>
  ),
  Gas: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
      <path d="M15 22V10a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/>
      <path d="M19 6V4"/>
      <path d="M3 22h12"/>
    </svg>
  ),
  Sparkle: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Disconnect: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Copy: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Spinner: ({ className = "w-5 h-5" }: { className?: string }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
};

/* ============================================
   WALLET CONFIGURATION
   ============================================ */

interface WalletInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  gasless: boolean;
  recommended?: boolean;
  description: string;
}

const WALLET_CONFIG: Record<string, Omit<WalletInfo, 'id'>> = {
  coinbase: {
    name: 'Coinbase Smart Wallet',
    icon: <Icons.Coinbase />,
    gasless: true,
    recommended: true,
    description: 'No gas fees required',
  },
  metamask: {
    name: 'MetaMask',
    icon: <Icons.MetaMask />,
    gasless: false,
    description: 'Requires ETH for gas',
  },
};

/* ============================================
   UTILITIES
   ============================================ */

type RawConnector = { id: string; name: string };

const getWalletType = (connector: RawConnector): 'coinbase' | 'metamask' | 'unknown' => {
  const id = connector.id.toLowerCase();
  const name = connector.name.toLowerCase();
  
  if (id.includes('coinbase') || name.includes('coinbase')) return 'coinbase';
  if (id === 'injected' || id.includes('metamask') || name.includes('metamask')) return 'metamask';
  return 'unknown';
};

const deduplicateConnectors = (connectors: RawConnector[]): Array<RawConnector & { type: string }> => {
  const seen = new Set<string>();
  
  return connectors
    .map(c => ({ ...c, type: getWalletType(c) }))
    .filter(connector => {
      if (connector.type === 'unknown') return true;
      if (seen.has(connector.type)) return false;
      seen.add(connector.type);
      return true;
    });
};

const getWalletInfo = (connector: RawConnector & { type: string }): WalletInfo => {
  const config = WALLET_CONFIG[connector.type] || {
    name: connector.name,
    icon: <Icons.Wallet />,
    gasless: false,
    description: 'External wallet',
  };
  return { ...config, id: connector.id };
};

/* ============================================
   WALLET MODAL
   ============================================ */

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (connectorId: string) => void;
  connectors: RawConnector[];
  isPending: boolean;
  pendingConnector: string | null;
}

const WalletModal = ({ 
  isOpen, 
  onClose, 
  onSelect, 
  connectors, 
  isPending, 
  pendingConnector 
}: WalletModalProps) => {
  
  const wallets = deduplicateConnectors(connectors)
    .map(getWalletInfo)
    .sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      if (a.gasless && !b.gasless) return -1;
      if (!a.gasless && b.gasless) return 1;
      return 0;
    });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.19, 1, 0.22, 1] }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]
                       w-[90vw] max-w-[400px]
                       bg-[#0a0a0b] border border-white/10 rounded-2xl
                       shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <div>
                <h2 className="text-lg font-semibold text-white">Connect Wallet</h2>
                <p className="text-xs text-zinc-500 mt-0.5">Choose your preferred wallet</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            <div className="p-4 space-y-2">
              {wallets.map((wallet) => {
                const isLoading = isPending && pendingConnector === wallet.id;
                
                return (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => onSelect(wallet.id)}
                    disabled={isPending}
                    className={`
                      w-full flex items-center gap-4 p-4
                      rounded-xl transition-all duration-200
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${wallet.recommended 
                        ? 'bg-blue-500/10 border-2 border-blue-500/30 hover:border-blue-500/50' 
                        : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                      }
                    `}
                  >
                    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-xl">
                      {wallet.icon}
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{wallet.name}</span>
                        {wallet.recommended && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {wallet.gasless ? (
                          <>
                            <Icons.Sparkle />
                            <span className="text-xs text-green-400 font-medium">{wallet.description}</span>
                          </>
                        ) : (
                          <>
                            <Icons.Gas />
                            <span className="text-xs text-zinc-500">{wallet.description}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isLoading && <Icons.Spinner className="w-5 h-5 text-zinc-400" />}
                  </motion.button>
                );
              })}
            </div>

            <div className="p-4 pt-2 border-t border-white/5 bg-zinc-950/50">
              <p className="text-[11px] text-center text-zinc-600">
                <span className="text-green-500">✦</span> Gasless wallets use account abstraction — no ETH needed
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

/* ============================================
   CONNECTED DROPDOWN
   ============================================ */

interface ConnectedDropdownProps {
  address: string;
  connectorId?: string;
  onDisconnect: () => void;
}

const ConnectedDropdown = ({ address, connectorId, onDisconnect }: ConnectedDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  
  const walletType = connectorId ? getWalletType({ id: connectorId, name: '' }) : 'unknown';
  const walletConfig = WALLET_CONFIG[walletType];
  const isGasless = walletConfig?.gasless ?? false;

  const copyAddress = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-[40px] px-3
                   bg-zinc-900 hover:bg-zinc-800
                   border border-zinc-800 hover:border-zinc-700
                   rounded-xl transition-all duration-200
                   text-white font-medium text-sm"
      >
        <div className="w-6 h-6 flex items-center justify-center">
          {walletConfig?.icon || <Icons.Wallet />}
        </div>
        
        <span className="font-mono text-sm">{formatAddress(address)}</span>
        
        {isGasless && (
          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-green-500/20 text-green-400 rounded">
            Gasless
          </span>
        )}
        
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[99]" onClick={() => setIsOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-[100]
                         w-[280px] 
                         bg-[#0a0a0b] border border-white/10 rounded-xl
                         shadow-2xl shadow-black/50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-xl">
                    {walletConfig?.icon || <Icons.Wallet />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {walletConfig?.name || 'Wallet'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-zinc-500">Connected</span>
                      {isGasless && <span className="text-xs text-green-400">• Gasless</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center justify-between gap-2 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
                  <span className="text-xs text-zinc-400 font-mono truncate">{address}</span>
                  <button
                    onClick={copyAddress}
                    className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                  >
                    {copied ? <Icons.Check /> : <Icons.Copy />}
                  </button>
                </div>
              </div>

              <div className="p-2 pt-0">
                <button
                  onClick={() => {
                    onDisconnect();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3
                             text-red-400 hover:text-red-300 hover:bg-red-500/10
                             rounded-lg transition-colors text-sm font-medium"
                >
                  <Icons.Disconnect />
                  Disconnect
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ============================================
   MAIN CONNECT BUTTON
   ============================================ */

export function ConnectButton() {
  const [isMounted, setIsMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingConnector, setPendingConnector] = useState<string | null>(null);

  const { address, isConnected, connector } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelectWallet = (connectorId: string) => {
    const selectedConnector = connectors.find(c => c.id === connectorId);
    if (selectedConnector) {
      setPendingConnector(connectorId);
      connect(
        { connector: selectedConnector },
        {
          onSuccess: () => {
            setModalOpen(false);
            setPendingConnector(null);
          },
          onError: () => {
            setPendingConnector(null);
          },
        }
      );
    }
  };

  if (!isMounted) {
    return <div className="h-[40px] w-[160px] rounded-xl bg-zinc-800 animate-pulse" />;
  }

  if (isConnected && address) {
    return (
      <ConnectedDropdown 
        address={address} 
        connectorId={connector?.id}
        onDisconnect={() => disconnect()} 
      />
    );
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 h-[40px] px-5
                   bg-white hover:bg-zinc-100
                   rounded-xl transition-all duration-200
                   text-zinc-900 font-medium text-sm
                   shadow-sm hover:shadow-md"
      >
        <Icons.Wallet />
        <span>Connect Wallet</span>
      </motion.button>

      <WalletModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelectWallet}
        connectors={connectors.map(c => ({ id: c.id, name: c.name }))}
        isPending={isPending}
        pendingConnector={pendingConnector}
      />
    </>
  );
}

export default ConnectButton;