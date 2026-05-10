'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Globe } from 'lucide-react';

export default function Header() {
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translations = {
    en: { title: 'BetAman', subtitle: 'Home Trust', menu: 'Dashboard' },
    am: { title: 'ብዓታማን', subtitle: 'የመነጩ ምንዑ', menu: 'ማሞታ' }
  };

  const t = translations[language];

  return (
    <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0f0f0f]/60 border-b border-[#2d2d2d]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 overflow-hidden rounded-lg bg-gradient-to-br from-[#d4af37] to-[#a98630]">
            <Image
              src="/images/logo.jpg"
              alt="BetAman"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-0">
            <h1 className="font-bold text-lg text-white tracking-tight">{t.title}</h1>
            <p className="text-xs text-[#d4af37] font-semibold">{t.subtitle}</p>
          </div>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition">
            {t.menu}
          </Link>
          <Link href="/submit" className="text-sm text-gray-400 hover:text-white transition">
            Submit Listing
          </Link>
          <Link href="/reputation" className="text-sm text-gray-400 hover:text-white transition">
            Reputation
          </Link>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'am' : 'en')}
            className="p-2 rounded-lg hover:bg-[#2d2d2d] transition text-gray-400 hover:text-white"
            title="Toggle language"
          >
            <Globe className="w-5 h-5" />
          </button>

          {/* Wallet Connection */}
          {mounted && <WalletMultiButton />}
        </div>
      </div>
    </header>
  );
}
