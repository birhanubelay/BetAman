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
      const storedWallet = typeof window !== 'undefined'
        ? localStorage.getItem('walletAddress')
        : null;

      if (storedWallet) {
        setWalletAddress(storedWallet);
        const response = await supabase
          .from('users')
          .select('role')
          .eq('wallet_address', storedWallet)
          .maybeSingle();

        const data = response.data as { role: Role } | null;
        if (data?.role) setRole(data.role);
      }
    } catch (error) {
      console.error('UserContext error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Runs EXACTLY ONCE. No 'loading' in dependencies to prevent infinite loops.
  useEffect(() => {
    refreshUser();
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