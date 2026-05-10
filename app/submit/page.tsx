// app/submit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useUser } from '@/components/UserContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function SubmitPage() {
  const router = useRouter();
  const { role, loading } = useUser();
  const [formData, setFormData] = useState({
    location: 'Bole',
    price: '15000',
    description: '',
    images: [] as File[],
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locations = ['Bole', 'Summit', 'Sarbet', 'Kolfe', 'Yeka', 'Addis Ketema'];

  // ✅ STRICT ROLE GUARD: Only landlords/brokers can access
  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.replace('/?role-required=true');
      return;
    }
    if (role === 'tenant') {
      router.replace('/'); // Tenants go to listings
    }
  }, [role, loading, router]);

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
      </div>
    );
  }

  // If not landlord/broker, don't render
  if (role !== 'landlord' && role !== 'broker') return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5)
    }));
    setError(null);
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('location', formData.location);
      data.append('price', formData.price);
      data.append('description', formData.description);
      formData.images.forEach((img) => data.append('images', img));

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        // ✅ Brokers/Landlords go to escrow setup, NOT analysis page
        router.push(`/escrow/setup?propertyId=${result.analysisId}`);
      } else {
        setError(result.error || 'Submission failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="mb-10">
            <Link href="/" className="text-[#d4af37] hover:text-[#c59b2b] text-sm font-semibold mb-4 inline-block">
              ← Back to Listings
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Submit Property</h1>
            <p className="text-gray-400">Upload details for AI verification & secure escrow setup.</p>
          </div>

          {error && (
            <Card className="bg-red-500/10 border-red-500/30 p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
              <label className="block text-sm font-semibold text-white mb-3">Location (Addis Ababa District)</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 bg-[#2d2d2d] text-white rounded-lg border border-[#3a3a3a] focus:border-[#d4af37] focus:outline-none transition"
              >
                {locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
              <label className="block text-sm font-semibold text-white mb-3">Monthly Price (ETB)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="e.g., 15000"
                className="bg-[#2d2d2d] text-white border-[#3a3a3a] focus:border-[#d4af37]"
              />
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
              <label className="block text-sm font-semibold text-white mb-3">Property Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe bedrooms, amenities, condition, availability..."
                rows={5}
                className="w-full px-4 py-3 bg-[#2d2d2d] text-white rounded-lg border border-[#3a3a3a] focus:border-[#d4af37] focus:outline-none transition resize-none"
              />
            </Card>

            <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
              <label className="block text-sm font-semibold text-white mb-4">Property Photos (1-5)</label>
              {formData.images.length === 0 ? (
                <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-[#3a3a3a] rounded-lg hover:border-[#d4af37]/50 cursor-pointer transition group">
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto text-[#d4af37]/60 group-hover:text-[#d4af37] transition mb-2" />
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                  </div>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-[#3a3a3a]" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition">✕</button>
                      </div>
                    ))}
                  </div>
                  {formData.images.length < 5 && (
                    <label className="flex items-center justify-center w-full px-6 py-8 border border-dashed border-[#3a3a3a] rounded-lg hover:border-[#d4af37]/50 cursor-pointer transition">
                      <p className="text-sm text-gray-400">Add more ({formData.images.length}/5)</p>
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              )}
            </Card>

            <div className="flex gap-4">
              <Button type="submit" disabled={loadingSubmit || formData.images.length === 0} className="flex-1 bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12 disabled:opacity-50">
                {loadingSubmit ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Submitting...</>) : 'Submit & Setup Escrow'}
              </Button>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full h-12 border-[#2d2d2d] hover:bg-[#1a1a1a]">Cancel</Button>
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}