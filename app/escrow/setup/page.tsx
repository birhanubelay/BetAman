// app/escrow/setup/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Shield } from 'lucide-react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import EscrowFlow from '@/components/EscrowFlow';

function EscrowSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');
  const [showEscrow, setShowEscrow] = useState(false);

  useEffect(() => {
    // Auto-show escrow after a brief moment
    const timer = setTimeout(() => setShowEscrow(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!propertyId) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-32 flex items-center justify-center">
          <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-8 max-w-md text-center">
            <Shield className="w-12 h-12 text-[#d4af37] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Property Selected</h2>
            <p className="text-gray-400 mb-6">Please go back and select a property first.</p>
            <Button onClick={() => router.push('/')} className="bg-[#d4af37] text-black">
              Back to Dashboard
            </Button>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="text-[#d4af37] hover:text-[#c59b2b] text-sm font-semibold mb-4 inline-block"
            >
              ← Back to Analysis
            </button>
            <h1 className="text-3xl font-bold text-white mb-2">Secure Escrow Protection</h1>
            <p className="text-gray-400">
              Your payment is protected until you verify the property in person
            </p>
          </div>

          {showEscrow && (
            <EscrowFlow 
              propertyId={propertyId}
              onEscrowComplete={() => {
                console.log('Escrow completed!');
                // Show success message or redirect
                setTimeout(() => router.push('/'), 2000);
              }}
            />
          )}
        </div>
      </main>
    </>
  );
}

export default function EscrowSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    }>
      <EscrowSetupContent />
    </Suspense>
  );
}