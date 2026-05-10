// app/submit/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useUser } from '@/components/UserContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, AlertCircle, CheckCircle2, Trash2, Eye, MapPin, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  location: string;
  price: number;
  description: string;
  images: string[];
  createdAt: string;
  riskScore?: number;
}

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
  const [success, setSuccess] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);

  const locations = ['Bole', 'Summit', 'Sarbet', 'Kolfe', 'Yeka', 'Addis Ketema'];

  // STRICT ROLE GUARD: Only landlords/brokers can access
  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.replace('/?role-required=true');
      return;
    }
    if (role === 'tenant') {
      router.replace('/');
    }
  }, [role, loading, router]);

  // Load my listings from localStorage
  useEffect(() => {
    const loadMyListings = () => {
      try {
        const stored = localStorage.getItem('broker_listings');
        if (stored) {
          setMyListings(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load listings:', error);
      } finally {
        setLoadingListings(false);
      }
    };
    
    loadMyListings();
  }, []);

  // Save listing to localStorage
  const saveListing = (listing: Listing) => {
    try {
      const updated = [listing, ...myListings];
      localStorage.setItem('broker_listings', JSON.stringify(updated));
      setMyListings(updated);
    } catch (error) {
      console.error('Failed to save listing:', error);
    }
  };

  // Delete listing
  const deleteListing = (id: string) => {
    const updated = myListings.filter(l => l.id !== id);
    localStorage.setItem('broker_listings', JSON.stringify(updated));
    setMyListings(updated);
  };

  if (loading || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/70 z-0" />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#d4af37] mx-auto mb-4" />
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (role !== 'landlord' && role !== 'broker') return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5)
    }));
    setError(null);
    setSuccess(null);
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
    setSuccess(null);

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
        // Create image URLs for storage
        const imageUrls = formData.images.map((img) => URL.createObjectURL(img));
        
        const newListing: Listing = {
          id: result.analysisId,
          location: formData.location,
          price: parseInt(formData.price),
          description: formData.description,
          images: imageUrls,
          createdAt: new Date().toISOString(),
          riskScore: result.riskScore || 75,
        };
        
        saveListing(newListing);
        setSuccess('Property submitted successfully! AI analysis complete.');
        
        // Reset form
        setFormData({
          location: 'Bole',
          price: '15000',
          description: '',
          images: [],
        });
        
        setTimeout(() => {
          router.push(`/analysis/${result.analysisId}`);
        }, 2000);
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
      
      {/* Background Image Container */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffc?w=1920&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <main className="min-h-screen pt-12 pb-20 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Submit Form Section */}
          <div className="mb-12">
            <div className="mb-10">
              <Link href="/" className="text-[#d4af37] hover:text-[#c59b2b] text-sm font-semibold mb-4 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-4xl font-bold text-white mb-2">Submit New Property</h1>
              <p className="text-gray-300">
                {role === 'landlord' ? 'List your property for rent' : 'Add a property listing for your client'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <Card className="bg-green-500/20 backdrop-blur border-green-500/30 p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-green-200 font-semibold">Success!</p>
                  <p className="text-sm text-green-200/80">{success}</p>
                  <p className="text-xs text-green-200/60 mt-1">Redirecting to analysis page...</p>
                </div>
              </Card>
            )}

            {/* Error Message */}
            {error && (
              <Card className="bg-red-500/20 backdrop-blur border-red-500/30 p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                <label className="block text-sm font-semibold text-white mb-3">Location (Addis Ababa District)</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:border-[#d4af37] focus:outline-none transition"
                >
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                <label className="block text-sm font-semibold text-white mb-3">Monthly Price (ETB)</label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="e.g., 15000"
                  className="bg-black/30 text-white border-white/20 focus:border-[#d4af37]"
                />
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                <label className="block text-sm font-semibold text-white mb-3">Property Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe bedrooms, amenities, condition, availability..."
                  rows={5}
                  className="w-full px-4 py-3 bg-black/30 text-white rounded-lg border border-white/20 focus:border-[#d4af37] focus:outline-none transition resize-none"
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 Tip: Be detailed! Better descriptions get more views.
                </p>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6">
                <label className="block text-sm font-semibold text-white mb-4">Property Photos (1-5)</label>
                {formData.images.length === 0 ? (
                  <label className="flex items-center justify-center w-full px-6 py-12 border-2 border-dashed border-white/30 rounded-lg hover:border-[#d4af37]/50 cursor-pointer transition group">
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto text-[#d4af37]/60 group-hover:text-[#d4af37] transition mb-2" />
                      <p className="text-sm text-gray-300 group-hover:text-gray-200">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB each</p>
                    </div>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={URL.createObjectURL(img)} alt={`Preview ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border border-white/20" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx)} 
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-xs w-5 h-5 flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    {formData.images.length < 5 && (
                      <label className="flex items-center justify-center w-full px-6 py-8 border border-dashed border-white/30 rounded-lg hover:border-[#d4af37]/50 cursor-pointer transition">
                        <p className="text-sm text-gray-300">Add more ({formData.images.length}/5)</p>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
              </Card>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={loadingSubmit || formData.images.length === 0} 
                  className="flex-1 bg-[#d4af37] hover:bg-[#c59b2b] text-black font-bold h-12 disabled:opacity-50"
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Property...
                    </>
                  ) : (
                    'Submit for AI Analysis'
                  )}
                </Button>
                <Link href="/" className="flex-1">
                  <Button variant="outline" className="w-full h-12 border-white/20 text-white hover:bg-white/10">Cancel</Button>
                </Link>
              </div>
            </form>
          </div>

          {/* My Listings Section */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">My Listings</h2>
              <p className="text-sm text-gray-300">{myListings.length} property{myListings.length !== 1 ? 's' : ''}</p>
            </div>

            {loadingListings ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#d4af37]" />
              </div>
            ) : myListings.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-12 text-center">
                <p className="text-gray-300 mb-2">No properties listed yet</p>
                <p className="text-sm text-gray-400">Submit your first property above to see it here</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <Card key={listing.id} className="bg-white/10 backdrop-blur-lg border-white/20 overflow-hidden hover:border-[#d4af37]/50 transition-all group">
                    <div className="h-48 bg-black/50 relative overflow-hidden">
                      {listing.images[0] ? (
                        <img 
                          src={listing.images[0]} 
                          alt={listing.location} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2 py-1 bg-[#d4af37]/90 text-black text-xs font-semibold rounded">
                        Score: {listing.riskScore || 75}%
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#d4af37] transition">
                        {listing.location}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{listing.location}, Addis Ababa</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-[#d4af37] font-bold">
                          <DollarSign className="w-4 h-4" />
                          <span className="text-lg">{listing.price.toLocaleString()} ETB</span>
                          <span className="text-xs text-gray-300">/mo</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => router.push(`/analysis/${listing.id}`)}
                          className="flex-1 bg-[#d4af37] hover:bg-[#c59b2b] text-black font-semibold text-sm h-9"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button 
                          onClick={() => deleteListing(listing.id)}
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-9 px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Card for Landlords/Brokers */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 p-6 mt-8">
            <h3 className="font-bold text-white mb-2">What happens next?</h3>
            <ol className="space-y-2 text-sm text-gray-300">
              <li>1. Our AI analyzes your property for fraud indicators</li>
              <li>2. You'll receive a detailed risk score and verification report</li>
              <li>3. Set up secure escrow to protect tenant payments</li>
              <li>4. Your listing goes live on the marketplace</li>
            </ol>
          </Card>
        </div>
      </main>
    </>
  );
}