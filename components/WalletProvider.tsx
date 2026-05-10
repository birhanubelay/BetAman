// components/WalletProvider.tsx
'use client';

// ✅ Local Solana CSS (no @import issues)
import '../styles/vendor/solana-wallet.css';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// ✅ Wallet adapters
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { Coin98WalletAdapter } from '@solana/wallet-adapter-coin98';

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Use env var for RPC, fallback to devnet
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.devnet.solana.com',
    []
  );

  // ✅ Add all wallet adapters here
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new Coin98WalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}