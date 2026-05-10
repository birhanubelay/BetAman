// components/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

type Role = 'tenant' | 'landlord' | 'broker' | null;

interface UserContextType {
  role: Role;
  walletAddress: string | null;
  loading: boolean;
  setRole: (role: Role) => void;
  setWalletAddress: (address: string) => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      // Get wallet from localStorage (set by wallet adapter)
      const storedWallet = localStorage.getItem('walletAddress');
      
      if (storedWallet) {
        setWalletAddress(storedWallet);
        
        // Fetch role from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('wallet_address', storedWallet)
          .maybeSingle();
        
        if (error) throw error;
        if (data?.role) {
          setRole(data.role as Role);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  // ✅ Listen for wallet changes
  useEffect(() => {
    const handleWalletChange = (event: StorageEvent) => {
      if (event.key === 'walletAddress') {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleWalletChange);
    return () => window.removeEventListener('storage', handleWalletChange);
  }, []);

  return (
    <UserContext.Provider value={{ 
      role, 
      walletAddress, 
      loading, 
      setRole, 
      setWalletAddress,
      refreshUser 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};