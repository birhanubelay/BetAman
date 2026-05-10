// app/reputation/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import ReputationBadge from '@/components/ReputationBadge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Star, Shield, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// ✅ Force dynamic rendering (no static generation at build time)
export const dynamic = 'force-dynamic';

interface Reputation {
  id: string;
  wallet_address: string;
  role: 'tenant' | 'landlord' | 'broker';
  count: number;
  metadata?: any;
  created_at: string;
}

export default function ReputationPage() {
  const { publicKey, connected } = useWallet();
  const [reputations, setReputations] = useState<Reputation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    // Only fetch if wallet is connected
    if (!connected || !publicKey) {
      setLoading(false);
      return;
    }

    const fetchReputation = async () => {
      try {
        // First try to get from localStorage (mock data for demo)
        const mockReputations = localStorage.getItem(`mock_reputation_${publicKey.toString()}`);
        
        if (mockReputations) {
          const parsed = JSON.parse(mockReputations);
          setReputations(parsed);
          setUsingMockData(true);
          setLoading(false);
          return;
        }
        
        // If no mock data, try Supabase
        const { data, error } = await supabase
          .from('reputation_nfts')
          .select('*')
          .eq('wallet_address', publicKey.toString())
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Filter out any null/undefined items
        const validData = (data || []).filter((r): r is Reputation => r !== null && r.created_at !== undefined);
        setReputations(validData);
        
        // If no data in Supabase, create demo data
        if (validData.length === 0) {
          const demoReputation: Reputation = {
            id: `demo_${Date.now()}`,
            wallet_address: publicKey.toString(),
            role: 'tenant',
            count: 1,
            metadata: {
              earned_at: new Date().toISOString(),
              transaction_type: 'demo_escrow',
              demo: true
            },
            created_at: new Date().toISOString()
          };
          
          // Save to localStorage for demo
          localStorage.setItem(`mock_reputation_${publicKey.toString()}`, JSON.stringify([demoReputation]));
          setReputations([demoReputation]);
          setUsingMockData(true);
        }
      } catch (err: any) {
        console.error('Failed to fetch reputation:', err);
        setError(err.message || 'Failed to load reputation');
        
        // Create fallback mock data on error
        if (publicKey) {
          const fallbackReputation: Reputation = {
            id: `fallback_${Date.now()}`,
            wallet_address: publicKey.toString(),
            role: 'tenant',
            count: 1,
            metadata: {
              earned_at: new Date().toISOString(),
              transaction_type: 'demo_escrow',
              demo: true,
              fallback: true
            },
            created_at: new Date().toISOString()
          };
          setReputations([fallbackReputation]);
          setUsingMockData(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReputation();
  }, [connected, publicKey]);

  // Show connect prompt if wallet not connected
  if (!connected) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-12 pb-20">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8">
              <AlertCircle className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Connect Wallet</h2>
              <p className="text-gray-400 mb-6">
                Connect your Solana wallet to view your reputation and earned badges.
              </p>
              <Link href="/">
                <Button className="bg-[#d4af37] hover:bg-[#c59b2b] text-black">
                  Back to Home
                </Button>
              </Link>
            </Card>
          </div>
        </main>
      </>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto mb-4" />
            <p className="text-gray-400">Loading your reputation...</p>
          </div>
        </main>
      </>
    );
  }

  // Safe aggregation with null checks
  const tenantCount = reputations.filter(r => r?.role === 'tenant').reduce((sum, r) => sum + (r?.count || 0), 0);
  const landlordCount = reputations.filter(r => r?.role === 'landlord').reduce((sum, r) => sum + (r?.count || 0), 0);
  const brokerCount = reputations.filter(r => r?.role === 'broker').reduce((sum, r) => sum + (r?.count || 0), 0);

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <Link href="/" className="text-[#d4af37] hover:text-[#c59b2b] text-sm font-semibold mb-4 inline-block">
              ← Back
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Your Reputation</h1>
            <p className="text-gray-400">Verified transactions and earned badges</p>
            {usingMockData && (
              <div className="mt-2 inline-flex items-center gap-1 bg-[#d4af37]/10 text-[#d4af37] text-xs px-2 py-1 rounded-full">
                <Sparkles className="w-3 h-3" />
                Demo Mode
              </div>
            )}
          </div>

          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 mb-8">
            <p className="text-xs text-gray-400 font-semibold mb-2">CONNECTED WALLET</p>
            <p className="font-mono text-sm text-white break-all">
              {publicKey?.toString() || 'Not connected'}
            </p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 text-center">
              <Star className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">{tenantCount}</p>
              <p className="text-sm text-gray-400">Verified Rentals</p>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 text-center">
              <Shield className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">{landlordCount}</p>
              <p className="text-sm text-gray-400">Verified Listings</p>
            </Card>
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 text-center">
              <Award className="w-8 h-8 text-[#d4af37] mx-auto mb-3" />
              <p className="text-3xl font-bold text-white">{brokerCount}</p>
              <p className="text-sm text-gray-400">Verified Deals</p>
            </Card>
          </div>

          <h2 className="text-2xl font-bold text-white mb-6">Earned Badges</h2>
          
          {error && (
            <Card className="bg-yellow-500/10 border-yellow-500/30 p-4 mb-6">
              <p className="text-sm text-yellow-200">{error} (Using demo data)</p>
            </Card>
          )}
          
          {reputations.length === 0 ? (
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 text-center">
              <p className="text-gray-400 mb-4">No reputation badges yet.</p>
              <p className="text-sm text-gray-500 mb-6">
                Complete a demo escrow transaction to earn your first reputation badge!
              </p>
              <Link href="/">
                <Button className="bg-[#d4af37] hover:bg-[#c59b2b] text-black">
                  Browse Properties
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {reputations.map((rep) => (
                rep?.id && <ReputationBadge key={rep.id} reputation={rep} size="lg" />
              ))}
            </div>
          )}

          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6 mt-10">
            <h3 className="font-bold text-white mb-4">How to Earn Reputation (Demo)</h3>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex gap-3">
                <span className="text-[#d4af37] font-bold">1.</span>
                <span>Click "Initiate Secure Escrow" on any property</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#d4af37] font-bold">2.</span>
                <span>Click "Confirm Viewing & Release Funds"</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#d4af37] font-bold">3.</span>
                <span>Your reputation badge will appear instantly! ✨</span>
              </li>
            </ol>
            <p className="text-xs text-gray-500 mt-4">
              Demo mode: Reputation is stored locally for demonstration purposes.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}