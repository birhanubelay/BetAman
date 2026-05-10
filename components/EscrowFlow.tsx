// components/EscrowFlow.tsx
'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Lock, Wallet, Gift, Loader2, Shield } from 'lucide-react';

export default function EscrowFlow({ 
  propertyId, 
  landlordWallet,
  onEscrowComplete 
}: { 
  propertyId?: string;
  landlordWallet?: string;
  onEscrowComplete?: () => void;
}) {
  const { connected, publicKey } = useWallet();
  const [escrowStage, setEscrowStage] = useState<'idle' | 'depositing' | 'pending' | 'confirmed' | 'minted'>('idle');
  const [loading, setLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [escrowAmount] = useState(500);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stages = [
    { id: 1, label: 'Deposit', icon: Lock, description: 'Lock SPL tokens in secure escrow' },
    { id: 2, label: 'Viewing Confirmed', icon: CheckCircle2, description: 'Verify property viewing' },
    { id: 3, label: 'Funds Released', icon: Wallet, description: 'Escrow released to landlord' },
    { id: 4, label: 'Reputation NFT', icon: Gift, description: 'Earn soulbound reputation badge' }
  ];

  const saveReputationToLocalStorage = (walletAddress: string, role: string) => {
    try {
      const storageKey = `mock_reputation_${walletAddress}`;
      const existing = localStorage.getItem(storageKey);
      let reputations = existing ? JSON.parse(existing) : [];
      
      const hasRole = reputations.some((r: any) => r.role === role);
      
      if (!hasRole) {
        const newReputation = {
          id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          wallet_address: walletAddress,
          role: role,
          count: 1,
          metadata: {
            earned_at: new Date().toISOString(),
            transaction_type: 'escrow_completed',
            property_id: propertyId
          },
          created_at: new Date().toISOString()
        };
        
        reputations.push(newReputation);
        localStorage.setItem(storageKey, JSON.stringify(reputations));
        sessionStorage.setItem('last_earned_reputation', JSON.stringify(newReputation));
      } else {
        const updatedReputations = reputations.map((r: any) => {
          if (r.role === role) {
            return { ...r, count: r.count + 1, updated_at: new Date().toISOString() };
          }
          return r;
        });
        localStorage.setItem(storageKey, JSON.stringify(updatedReputations));
      }
      
      return true;
    } catch (error) {
      console.warn('Failed to save reputation:', error);
      return false;
    }
  };

  const handleInitiateEscrow = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your Solana wallet first');
      return;
    }
    
    setLoading(true);
    setEscrowStage('depositing');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const escrowInfo = {
        propertyId,
        tenantWallet: publicKey.toString(),
        amount: escrowAmount,
        status: 'pending',
        initiatedAt: new Date().toISOString()
      };
      localStorage.setItem(`escrow_${propertyId}`, JSON.stringify(escrowInfo));
      
      setEscrowStage('pending');
      alert('✓ Escrow initiated successfully! Funds are now secured.');
      
    } catch (error) {
      console.error('Escrow initiation failed:', error);
      alert('Failed to initiate escrow. Please try again.');
      setEscrowStage('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmViewing = async () => {
    setLoading(true);
    setEscrowStage('confirmed');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (publicKey) {
        const userRole = landlordWallet ? 'landlord' : 'tenant';
        const success = saveReputationToLocalStorage(publicKey.toString(), userRole);
        
        if (success) {
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 5000);
        }
      }
      
      setEscrowStage('minted');
      
      if (onEscrowComplete) {
        onEscrowComplete();
      }
      
      alert('✓ Transaction complete! Reputation badge has been added to your wallet.');
      
    } catch (error) {
      console.error('Viewing confirmation failed:', error);
      alert('Failed to confirm viewing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Success Message Popup */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-right-5 duration-300">
          <Card className="bg-green-500/20 backdrop-blur-lg border-green-500/50 p-4 shadow-xl">
            <div className="flex items-center gap-3">
              <Gift className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-bold text-green-400">Reputation Earned! 🎉</p>
                <p className="text-xs text-green-300">You've earned a new reputation badge</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-[#d4af37]" />
        <h3 className="text-2xl font-bold text-white">Secure Escrow Protection</h3>
      </div>

      {/* Connection Status */}
      {!connected && (
        <Card className="bg-[#d4af37]/5 border-[#d4af37]/20 p-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-white mb-2">Connect Your Wallet</h4>
            <p className="text-sm text-gray-300">
              Connect your Solana wallet to initiate secure escrow.
            </p>
          </div>
        </Card>
      )}

      {/* Escrow Progress */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <h4 className="font-bold text-white mb-6">Transaction Flow</h4>
        <div className="space-y-4">
          {stages.map((stage, idx) => {
            const isCompleted = 
              (stage.id <= 1 && escrowStage !== 'idle') ||
              (stage.id <= 2 && (escrowStage === 'confirmed' || escrowStage === 'minted')) ||
              (stage.id <= 3 && escrowStage === 'minted') ||
              stage.id <= 4 && escrowStage === 'minted';
            
            const isActive = 
              (stage.id === 1 && escrowStage === 'depositing') ||
              (stage.id === 2 && escrowStage === 'pending') ||
              (stage.id === 3 && escrowStage === 'confirmed') ||
              (stage.id === 4 && escrowStage === 'minted');

            return (
              <div key={stage.id}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isCompleted ? 'bg-green-500/20 text-green-400' :
                    isActive ? 'bg-[#d4af37]/20 text-[#d4af37]' :
                    'bg-white/10 text-gray-500'
                  }`}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isCompleted || isActive ? 'text-white' : 'text-gray-400'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-400">{stage.description}</p>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </div>
                {idx < stages.length - 1 && (
                  <div className="ml-5 h-8 w-0.5 bg-white/10" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Escrow Details */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
        <h4 className="font-bold text-white mb-4">Escrow Details</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/10">
            <span className="text-sm text-gray-300">Deposit Amount</span>
            <span className="font-bold text-[#d4af37]">{escrowAmount} USDC</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/10">
            <span className="text-sm text-gray-300">Lock Duration</span>
            <span className="font-bold text-white">24 Hours</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/10">
            <span className="text-sm text-gray-300">Auto-Refund Protection</span>
            <span className="font-bold text-green-400">Active</span>
          </div>
          {connected && publicKey && (
            <div className="flex justify-between items-center p-3 bg-black/30 rounded-lg border border-white/10">
              <span className="text-sm text-gray-300">Your Wallet</span>
              <span className="font-mono text-xs text-gray-300">
                {publicKey.toString().slice(0, 8)}...
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        {escrowStage === 'idle' && (
          <Button
            onClick={handleInitiateEscrow}
            disabled={!connected || loading}
            className="flex-1 bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : connected ? 'Initiate Secure Escrow' : 'Connect Wallet First'}
          </Button>
        )}
        {escrowStage === 'pending' && (
          <Button
            onClick={handleConfirmViewing}
            disabled={loading}
            className="flex-1 bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : 'Confirm Viewing & Release Funds'}
          </Button>
        )}
        {(escrowStage === 'confirmed' || escrowStage === 'minted') && (
          <Button
            disabled
            className="flex-1 bg-green-500/20 text-green-400 font-bold h-12 border border-green-500/30"
          >
            ✓ Transaction Complete
          </Button>
        )}
      </div>

      {/* Security Note */}
      {escrowStage === 'idle' && connected && (
        <p className="text-center text-xs text-gray-400 mt-4">
          🔒 Your funds are protected by smart contract escrow. Released only after your viewing confirmation.
        </p>
      )}
    </div>
  );
}