'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Users, Briefcase, Loader2 } from 'lucide-react';
import { useUser } from '@/components/UserContext';

type Role = 'tenant' | 'landlord' | 'broker';

export default function RoleSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { publicKey, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const { role, setRole, loading, refreshUser } = useUser();
  
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingConnection, setIsAwaitingConnection] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!role && pathname !== '/' && !pathname.includes('role-required')) {
      router.replace('/?role-required=true');
    }
  }, [loading, role, pathname, router]);

  // Listen for successful connection after modal is closed
  useEffect(() => {
    if (isAwaitingConnection && connected && publicKey && selectedRole) {
      saveUserRole(publicKey.toString(), selectedRole);
    }
  }, [isAwaitingConnection, connected, publicKey, selectedRole]);

  const saveUserRole = async (walletAddress: string, roleToSave: Role) => {
    try {
      localStorage.setItem('walletAddress', walletAddress);
      
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: walletAddress, role: roleToSave }),
      });
      
      if (!response.ok) throw new Error('Failed to save role');
      
      setRole(roleToSave);
      await refreshUser();
      
      router.push(roleToSave === 'tenant' ? '/' : '/submit');
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to save role'}`);
    } finally {
      setIsProcessing(false);
      setIsAwaitingConnection(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedRole) return;
    setIsProcessing(true);
    
    try {
      if (!connected || !publicKey) {
        // Open wallet modal instead of calling connect() directly
        setIsAwaitingConnection(true);
        setVisible(true);
        // Don't proceed further - wait for connection via useEffect
        return;
      }
      
      // Already connected, save role directly
      await saveUserRole(publicKey.toString(), selectedRole);
    } catch (error: any) {
      alert(`Error: ${error.message || 'Failed to save role'}`);
      setIsProcessing(false);
      setIsAwaitingConnection(false);
    }
  };

  if (loading) return null;
  if (role) return null;

  const roles = [
    { id: 'tenant' as Role, title: 'I want to rent', desc: 'Browse properties, pay via escrow', icon: <Home className="w-8 h-8" /> },
    { id: 'landlord' as Role, title: 'I want to list', desc: 'Submit properties, receive payments', icon: <Users className="w-8 h-8" /> },
    { id: 'broker' as Role, title: 'I am a broker', desc: 'Manage listings, earn fees', icon: <Briefcase className="w-8 h-8" /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 max-w-2xl w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Select Your Role</h2>
        <p className="text-gray-400 mb-6 text-center">You must choose a role to access BetAman.</p>
        
        <div className="grid gap-4 mb-8">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRole(r.id)}
              disabled={isProcessing || connecting}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedRole === r.id 
                  ? 'border-[#d4af37] bg-[#d4af37]/10 ring-2 ring-[#d4af37]/50' 
                  : 'border-[#2d2d2d] hover:border-[#d4af37]/50'
              } ${isProcessing || connecting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  selectedRole === r.id ? 'bg-[#d4af37] text-black' : 'bg-[#2d2d2d] text-[#d4af37]'
                }`}>
                  {r.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white">{r.title}</h3>
                  <p className="text-sm text-gray-400">{r.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <Button
          onClick={handleContinue}
          disabled={!selectedRole || isProcessing || connecting}
          className="w-full bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12 disabled:opacity-50"
        >
          {isProcessing || connecting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isAwaitingConnection ? 'Connecting wallet...' : 'Processing...'}
            </>
          ) : selectedRole ? (
            `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
          ) : (
            'Continue'
          )}
        </Button>
      </Card>
    </div>
  );
}