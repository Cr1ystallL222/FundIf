'use client';

import React, { useState, useEffect } from 'react';
import { 
  ConnectWallet, 
  Wallet, 
  WalletDropdown, 
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Identity,
  Name,
} from '@coinbase/onchainkit/identity';
import { useAccount, useDisconnect } from 'wagmi';
import { motion } from 'framer-motion';

/* ============================================
   1. CUSTOM ICONS
   ============================================ */
const UserIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="text-black"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const DisconnectIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

/* ============================================
   2. MAIN COMPONENT
   ============================================ */

export function ConnectButton() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect(); // Use hook instead of rigid component
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return '';
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  if (!isMounted) {
    return (
      <div className="h-10 w-[110px] bg-[#D0F236] rounded-lg animate-pulse" />
    );
  }

  return (
    <div className="relative z-50">
      <Wallet>
        <ConnectWallet 
          // Removed invalid 'withWalletAggregator' prop
          className={`
            !h-10 !px-4 !min-w-[110px] !rounded-lg !border-none
            !transition-all !duration-200 !ease-out !cursor-pointer
            flex items-center justify-center gap-2
            ${isConnected 
              ? '!bg-white hover:!bg-zinc-100' 
              : '!bg-[#D0F236] hover:!bg-[#bfe024]'
            }
          `}
        >
          {isConnected ? (
            /* CONNECTED: User Icon + Text Address */
            <div className="flex items-center gap-2 pointer-events-none">
              <UserIcon />
              <span className="text-black text-sm font-bold font-mono tracking-tighter">
                {formatAddress(address)}
              </span>
            </div>
          ) : (
            /* DISCONNECTED: Simple Text */
            <span className="text-black font-bold text-sm tracking-wide pointer-events-none">
              Connect
            </span>
          )}
        </ConnectWallet>

        <WalletDropdown className="
          !absolute !top-full !right-0 !mt-2 !w-64
          !bg-[#09090b] !border !border-white/10 
          !rounded-xl !shadow-2xl !overflow-hidden
        ">
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Identity Info */}
            <Identity className="!px-5 !py-4 !bg-transparent border-b border-white/10">
              <Name className="!text-white !font-bold !text-lg" />
              <Address className="!text-zinc-500 !text-xs" />
            </Identity>

            {/* Custom Disconnect Button using wagmi hook */}
            <div className="p-2">
              <button 
                onClick={() => disconnect()}
                className="
                  w-full flex items-center justify-start gap-3 h-10 px-3
                  bg-transparent hover:bg-white/10 
                  text-zinc-300 hover:text-white
                  rounded-lg transition-colors
                  text-sm font-medium cursor-pointer
                  focus:outline-none
                "
              >
                <DisconnectIcon />
                <span>Disconnect</span>
              </button>
            </div>
          </motion.div>
        </WalletDropdown>
      </Wallet>
    </div>
  );
}

export default ConnectButton;