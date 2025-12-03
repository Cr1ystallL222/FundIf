// frontend/components/wallet/ConnectButton.tsx
'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Avatar,
  Name,
  Identity,
  Address,
} from '@coinbase/onchainkit/identity';

export function ConnectButton() {
  return (
    <Wallet>
      <ConnectWallet 
        className="min-w-[140px] bg-[#0052FF] hover:bg-[#0047E0] text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        <Avatar className="h-6 w-6" />
        <Name />
      </ConnectWallet>
      <WalletDropdown>
        <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
          <Avatar />
          <Name />
          <Address />
        </Identity>
        <WalletDropdownDisconnect />
      </WalletDropdown>
    </Wallet>
  );
}

export default ConnectButton;