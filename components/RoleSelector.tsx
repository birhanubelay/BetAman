// components/RoleSelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Briefcase, Loader2 } from 'lucide-react';
import { useUser } from '@/components/UserContext';

type Role = 'tenant' | 'landlord' | 'broker';

// ✅ Pages that don't require role selection (public pages)
const PUBLIC_PATHS = ['/', '/connect-wallet'];

export default function RoleSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { publicKey, connect } = useWallet();
  const { role, setRole, loading: userLoading } = useUser();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ✅ Block access if no role selected (except public pages)
  useEffect(() => {
    if (userLoading) return; // Wait for user context to load
    
    const isPublic = PUBLIC_PATHS.includes(pathname || '');
    
    // If user has no role AND not on public page, show modal and block navigation
    if (!role && !isPublic) {
      setShowModal(true);
      // Prevent navigation by forcing stay on current page
      if (pathname && !pathname.includes('role-select')) {
        router.replace('/?role-required=true');
      }
    } else {
      setShowModal(false);
    }
  }, [role, userLoading, pathname, router]);

  // ✅ If user already has role, never show modal
  if (role || userLoading) return null;
  
  // ✅ If on public path, don't block
  if (PUBLIC_PATHS.includes(pathname || '')) return null;

  const roles = [
    { 
      id: 'tenant' as Role, 
      title: 'I want to rent', 
      desc: 'Browse verified properties, pay via secure escrow, earn reputation', 
      icon: <Home className="w-8 h-8" /> 
    },
    { 
      id: 'landlord' as Role, 
      title: 'I want to list', 
      desc: 'Submit properties for AI verification, receive secure payments', 
      icon: <Users className="w-8 h-8" /> 
    },
    { 
      id: 'broker' as Role, 
      title: 'I am a broker', 
      desc: 'Manage listings for landlords, earn fees on successful deals', 
      icon: <Briefcase className="w-8 h-8" /> 
    },
  ];

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsProcessing(true);
    
    try {
      // ✅ Step 1: Connect wallet (REQUIRED before proceeding)
      if (!publicKey) {
        await connect();
        // Wait for wallet connection to complete
        let attempts = 0;
        while (!publicKey && attempts < 10) {
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
        if (!publicKey) {
          throw new Error('Wallet connection timed out. Please try again.');
        }
      }
      
      // ✅ Step 2: Save role + wallet to Supabase
      const walletAddress = publicKey!.toString();
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          wallet_address: walletAddress, 
          role: selectedRole 
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save role');
      }
      
      // ✅ Step 3: Update local context
      setRole(selectedRole);
      
      // ✅ Step 4: Role-based redirect (STRICT)
      if (selectedRole === 'tenant') {
        router.push('/'); // Tenant: sees property listings
      } else {
        router.push('/submit'); // Landlord/Broker: sees property submission
      }
      
      // ✅ Step 5: Close modal (will unblock UI)
      setShowModal(false);
      
    } catch (error: any) {
      console.error('Role selection failed:', error);
      alert(`Error: ${error.message || 'Failed to save role. Please try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Render blocking modal - NO WAY TO BYPASS
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 max-w-2xl w-full relative shadow-2xl">
        {/* No close button - user MUST select role */}
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to BetAman</h2>
          <p className="text-gray-400">
            Select your role to continue. This is required to access the platform.
          </p>
        </div>
        
        <div className="grid gap-4 mb-8">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id)}
              disabled={isProcessing}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                selectedRole === r.id 
                  ? 'border-[#d4af37] bg-[#d4af37]/10 ring-2 ring-[#d4af37]/50' 
                  : 'border-[#2d2d2d] hover:border-[#d4af37]/50 hover:bg-[#2d2d2d]/50'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg transition-colors ${
                  selectedRole === r.id 
                    ? 'bg-[#d4af37] text-black' 
                    : 'bg-[#2d2d2d] text-[#d4af37]'
                }`}>
                  {r.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{r.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">{r.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {/* Selected role preview */}
        {selectedRole && (
          <div className="mb-6 p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
            <p className="text-sm text-gray-300">
              Selected: <span className="font-semibold text-[#d4af37] capitalize">{selectedRole}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              You will need to connect your Solana wallet to proceed.
            </p>
          </div>
        )}
        
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isProcessing}
          className="w-full bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {publicKey ? 'Saving Role...' : 'Connecting Wallet...'}
            </>
          ) : (
            `Continue as ${selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : '...'}`
          )}
        </Button>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          By continuing, you agree to BetAman's Terms of Service and Privacy Policy.
        </p>
      </Card>
    </div>
  );
}