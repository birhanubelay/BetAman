'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Lock, Wallet, Gift, Loader2 } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase'; // ✅ Import supabaseAdmin

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
  const [escrowAmount] = useState(500); // 500 USDC

  const stages = [
    { id: 1, label: 'Deposit', icon: Lock, description: 'Lock SPL tokens in escrow' },
    { id: 2, label: 'Viewing Confirmed', icon: CheckCircle2, description: 'Confirm property viewing' },
    { id: 3, label: 'Funds Released', icon: Wallet, description: 'Escrow released to broker' },
    { id: 4, label: 'Reputation NFT', icon: Gift, description: 'Earn soulbound reputation badge' }
  ];

  const handleInitiateEscrow = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your Solana wallet first');
      return;
    }
    
    setLoading(true);
    setEscrowStage('depositing');
    
    try {
      // ✅ TODO: In production, call your Solana smart contract here
      // For now, simulate + save to Supabase for tracking
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Save escrow initiation to Supabase (optional audit trail)
      if (propertyId) {
        await supabaseAdmin.from('escrows').upsert({
          property_id: propertyId,
          tenant_wallet: publicKey.toString(),
          amount_usd: escrowAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        }, { onConflict: 'property_id,tenant_wallet' });
      }
      
      setEscrowStage('pending');
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
      // ✅ TODO: In production, call Solana contract to release funds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // ✅ MINT REPUTATION NFT (save to Supabase as placeholder)
      if (publicKey) {
        // Determine user role (simplified - in production, fetch from users table)
        const userRole = landlordWallet ? 'landlord' : 'tenant';
        
        // Upsert reputation: increment count if exists, or create new
        const { error } = await supabaseAdmin
          .from('reputation_nfts')
          .upsert({
            wallet_address: publicKey.toString(),
            role: userRole,
            count: 1, // In production, use: count: reputation?.count + 1 || 1
            metadata: {
              earned_at: new Date().toISOString(),
              transaction_type: 'escrow_completed',
              property_id: propertyId
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'wallet_address,role' });
        
        if (error) console.error('Failed to save reputation:', error);
      }
      
      setEscrowStage('minted');
      
      // ✅ Notify parent component that escrow is complete
      if (onEscrowComplete) {
        onEscrowComplete();
      }
      
    } catch (error) {
      console.error('Viewing confirmation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Secure Escrow & Reputation</h3>

      {/* Connection Status */}
      {!connected && (
        <Card className="bg-[#d4af37]/5 border-[#d4af37]/20 p-6 flex items-start gap-4">
          <AlertCircle className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-white mb-2">Connect Your Wallet</h4>
            <p className="text-sm text-gray-300">
              Please connect your Solana wallet (Phantom) to proceed with secure escrow.
            </p>
          </div>
        </Card>
      )}

      {/* Escrow Progress */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
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
                    'bg-[#2d2d2d] text-gray-500'
                  }`}>
                    <stage.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold ${isCompleted || isActive ? 'text-white' : 'text-gray-400'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-gray-500">{stage.description}</p>
                  </div>
                </div>
                {idx < stages.length - 1 && (
                  <div className="ml-5 h-8 w-0.5 bg-[#2d2d2d]" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Escrow Details */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
        <h4 className="font-bold text-white mb-4">Escrow Details</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
            <span className="text-sm text-gray-400">Deposit Amount</span>
            <span className="font-bold text-[#d4af37]">{escrowAmount} USDC</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
            <span className="text-sm text-gray-400">Lock Duration</span>
            <span className="font-bold text-white">24 Hours</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
            <span className="text-sm text-gray-400">Auto-Refund</span>
            <span className="font-bold text-green-400">Yes</span>
          </div>
          {connected && publicKey && (
            <div className="flex justify-between items-center p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
              <span className="text-sm text-gray-400">Your Wallet</span>
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
            ✓ Escrow Completed & Reputation Earned
          </Button>
        )}
      </div>
    </div>
  );
}