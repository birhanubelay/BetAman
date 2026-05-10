// app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import { useUser } from '@/components/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, Eye, Loader2 } from 'lucide-react';

// Mock properties for demo (replace with Supabase fetch later)
const MOCK_PROPERTIES = [
  { id: 'prop_1', title: 'Modern 3BR in Bole', location: 'Bole', price: 15000, image: '/images/house-1.jpg' },
  { id: 'prop_2', title: 'Luxury Villa in Summit', location: 'Summit', price: 25000, image: '/images/house-2.jpg' },
  { id: 'prop_3', title: 'Spacious Apartment in Yeka', location: 'Yeka', price: 12000, image: '/images/house-3.jpg' },
];

export default function TenantDashboard() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { role, loading } = useUser();

  // ✅ STRICT ROLE GUARD
  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.replace('/?role-required=true');
      return;
    }
    if (role === 'landlord' || role === 'broker') {
      router.replace('/submit'); // Brokers/Landlords go to posting page
    }
  }, [role, loading, router]);

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  // If not tenant, don't render (redirect handles it)
  if (role !== 'tenant') return null;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">Verified Properties</h1>
            <p className="text-gray-400">Browse AI-analyzed listings. Click "Analyze" to view fraud report & secure escrow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_PROPERTIES.map((prop) => (
              <Card key={prop.id} className="bg-[#1a1a1a] border-[#2d2d2d] overflow-hidden hover:border-[#d4af37]/30 transition">
                <div className="h-48 bg-[#2d2d2d] relative">
                  <img src={prop.image} alt={prop.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded">
                    AI Verified
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2">{prop.title}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>{prop.location}, Addis Ababa</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-[#d4af37] font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>{prop.price.toLocaleString()} ETB/mo</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => router.push(`/analysis/${prop.id}`)}
                    className="w-full bg-[#d4af37] hover:bg-[#c59b2b] text-black font-semibold"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Analyze & Book Viewing
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}