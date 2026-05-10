// components/Header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useUser } from '@/components/UserContext';
import { Globe, Menu, X, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();
  const { publicKey, disconnect, connecting, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const { role, setRole } = useUser();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Wait for React mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDisconnect = async () => {
    await disconnect();
    setRole(null);
    localStorage.removeItem('walletAddress');
    window.location.href = '/';
  };

  const handleConnectClick = () => {
    setVisible(true);
  };

  const navLinks = role === 'tenant' 
    ? [{ href: '/', label: 'Browse' }, { href: '/reputation', label: 'My Reputation' }]
    : [{ href: '/submit', label: 'Submit Property' }, { href: '/reputation', label: 'My Reputation' }];

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2d2d2d] bg-[#0f0f0f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo - Updated to use image from /images folder */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-gradient-to-br from-[#d4af37] to-[#b8962e] flex items-center justify-center">
            <Image 
              src="/images/logos.png" 
              alt="BetAman Logo" 
              width={50} 
              height={50}
              className="object-cover"
              onError={(e) => {
                // Fallback to text if image doesn't exist
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-white text-lg leading-tight group-hover:text-[#d4af37] transition">BetAman</span>
            <span className="text-[10px] text-gray-400 -mt-0.5">Fraud Detection</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition ${
                pathname === link.href 
                  ? 'text-[#d4af37]' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Wallet + Lang + Mobile Toggle */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-9 w-9 p-0">
            <Globe className="w-4 h-4" />
          </Button>

          {/* ✅ Custom Wallet Button - No WalletMultiButton dependency */}
          {mounted && (
            <>
              {connected && publicKey ? (
                <div className="flex items-center gap-2">
                  <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-md px-3 py-1.5 text-sm text-white">
                    <span className="text-[#d4af37]">◎</span> {formatAddress(publicKey.toString())}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleDisconnect}
                    className="text-gray-400 hover:text-red-400 h-9 px-3"
                    title="Disconnect wallet"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleConnectClick}
                  disabled={connecting}
                  className="bg-[#1a1a1a] border border-[#2d2d2d] text-white hover:bg-[#2d2d2d] font-medium h-9 px-4"
                >
                  {connecting ? (
                    <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Wallet className="w-4 h-4 mr-2" />
                  )}
                  Connect Wallet
                </Button>
              )}
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="md:hidden text-gray-400 hover:text-white h-9 w-9 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2d2d2d] bg-[#0f0f0f]">
          <div className="px-6 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-sm font-medium py-2 ${
                  pathname === link.href 
                    ? 'text-[#d4af37]' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {publicKey && (
              <button
                onClick={() => { handleDisconnect(); setMobileMenuOpen(false); }}
                className="block text-sm font-medium py-2 text-red-400 hover:text-red-300"
              >
                Disconnect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}