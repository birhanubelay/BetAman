// app/analysis/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import RiskScoreGauge from '@/components/RiskScoreGauge';
import AnalysisCheckCard from '@/components/AnalysisCheckCard';
import ImageAnalysisPanel from '@/components/ImageAnalysisPanel';
import LocationVerification from '@/components/LocationVerification';
import EscrowFlow from '@/components/EscrowFlow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, DollarSign, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import Link from 'next/link';

// ✅ FIX: params is a Promise in Next.js 16+
export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [proceedingToEscrow, setProceeding] = useState(false);
  const [unwrappedId, setUnwrappedId] = useState<string>('');

  // ✅ FIX: Unwrap params Promise on mount
  useEffect(() => {
    const unwrapParams = async () => {
      const { id } = await params;
      setUnwrappedId(id);
    };
    unwrapParams();
  }, [params]);

  // Mock analysis data for demo - ✅ Use unwrappedId instead of params.id
  const mockAnalysis = {
    id: unwrappedId,
    location: 'Bole',
    price: 15000,
    description: '3-bedroom modern house with furnished interior, large garden, available for immediate viewing',
    riskScore: 72,
    checks: {
      reverse_image: {
        pass: false,
        reason: 'Found in 4 other listings within the last month',
        confidence: 0.95,
        details: [
          'Listing 123 (Bole, 1 week ago)',
          'Listing 456 (Summit, 2 weeks ago)',
          'Similar perceptual hash matches detected'
        ]
      },
      location_verification: {
        pass: false,
        reason: 'Visual landmarks and EXIF GPS indicate different location than claimed',
        confidence: 0.87,
        details: [
          'EXIF GPS: 9.0088°N, 38.7754°E (Summit area)',
          'Landmark recognition: Modern city buildings suggest elevated area',
          'Claimed location: Bole (lower elevation)'
        ]
      },
      price_anomaly: {
        pass: false,
        reason: '40% below area median price - significant outlier',
        confidence: 0.92,
        details: [
          'Area median price: 25,000 ETB',
          'Listed price: 15,000 ETB',
          'Below 25th percentile - unusual for property quality'
        ]
      },
      urgency_language: {
        pass: false,
        reason: 'High-pressure language detected in description',
        confidence: 1.0,
        details: [
          'Keywords: "immediate viewing", "act now"',
          'Multiple time-sensitive phrases',
          'Common fraud indicator pattern'
        ]
      },
      description_match: {
        pass: true,
        reason: 'Property images align well with description',
        confidence: 0.88,
        details: [
          'Images confirm 3-bedroom layout',
          'Furnishings match description',
          'Garden visible in photos'
        ]
      }
    },
    images: [
      '/images/house-1.jpg',
      '/images/house-2.jpg',
      '/images/house-3.jpg'
    ],
    imageAnalysis: {
      exifStatus: 'available' as const,
      exifData: {
        gps: { lat: 9.0088, lng: 38.7754, altitude: 2356 },
        device: 'iPhone 13 Pro',
        timestamp: '2024-05-09T10:30:00Z',
        software: 'iOS 17.4'
      },
      screenshotDetected: false,
      photoOfPhotoDetected: false,
      perceptualHash: '8ff00ff00ff00ff0',
      hashMatches: [
        { image_id: 'listing_123', similarity: 0.98 },
        { image_id: 'listing_456', similarity: 0.95 }
      ],
      compressionLevel: 'normal' as const
    }
  };

  useEffect(() => {
    if (unwrappedId) {
      // Simulate loading analysis
      const timer = setTimeout(() => {
        setAnalysisData(mockAnalysis);
        setLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [unwrappedId]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-12 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#d4af37] mx-auto mb-4" />
            <p className="text-gray-400">Analyzing property...</p>
          </div>
        </main>
      </>
    );
  }

  if (!analysisData) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-12">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-gray-400">Analysis not found</p>
            <Link href="/">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <Link href="/" className="text-[#d4af37] hover:text-[#c59b2b] text-sm font-semibold mb-4 inline-block">
              ← Back
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">AI Fraud Detection Analysis</h1>
            <p className="text-gray-400">Comprehensive property verification results</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Risk Score */}
            <Card className="bg-[#1a1a1a] border-[#2d2d2d] lg:col-span-1 flex items-center justify-center p-8">
              <RiskScoreGauge score={analysisData.riskScore} />
            </Card>

            {/* Property Info */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">LOCATION</p>
                    <p className="text-xl font-bold text-white">{analysisData.location}</p>
                  </div>
                </div>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <div className="flex items-start gap-4">
                  <DollarSign className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">PRICE</p>
                    <p className="text-xl font-bold text-white">{analysisData.price.toLocaleString()} ETB</p>
                  </div>
                </div>
              </Card>
              <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
                <div className="flex items-start gap-4">
                  <FileText className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-xs text-gray-400 font-semibold">DESCRIPTION</p>
                    <p className="text-sm text-gray-300">{analysisData.description}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Analysis Checks */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Verification Checks</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalysisCheckCard
                title="Reverse Image Search"
                status={analysisData.checks.reverse_image.pass ? 'pass' : 'fail'}
                reason={analysisData.checks.reverse_image.reason}
                confidence={analysisData.checks.reverse_image.confidence}
                details={analysisData.checks.reverse_image.details}
              />
              <AnalysisCheckCard
                title="Location Verification"
                status={analysisData.checks.location_verification.pass ? 'pass' : 'fail'}
                reason={analysisData.checks.location_verification.reason}
                confidence={analysisData.checks.location_verification.confidence}
                details={analysisData.checks.location_verification.details}
              />
              <AnalysisCheckCard
                title="Price Anomaly Detection"
                status={analysisData.checks.price_anomaly.pass ? 'pass' : 'fail'}
                reason={analysisData.checks.price_anomaly.reason}
                confidence={analysisData.checks.price_anomaly.confidence}
                details={analysisData.checks.price_anomaly.details}
              />
              <AnalysisCheckCard
                title="Urgency Language Flags"
                status={analysisData.checks.urgency_language.pass ? 'pass' : 'fail'}
                reason={analysisData.checks.urgency_language.reason}
                confidence={analysisData.checks.urgency_language.confidence}
                details={analysisData.checks.urgency_language.details}
              />
              <AnalysisCheckCard
                title="Description-Photo Match"
                status={analysisData.checks.description_match.pass ? 'pass' : 'fail'}
                reason={analysisData.checks.description_match.reason}
                confidence={analysisData.checks.description_match.confidence}
                details={analysisData.checks.description_match.details}
              />
            </div>
          </div>

          {/* Images */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Property Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysisData.images.map((img: string, idx: number) => (
                <Card key={idx} className="bg-[#1a1a1a] border-[#2d2d2d] overflow-hidden">
                  <img src={img} alt={`Property ${idx + 1}`} className="w-full h-48 object-cover" />
                </Card>
              ))}
            </div>
          </div>

          {/* Image Analysis Details */}
          <div className="mb-10">
            <ImageAnalysisPanel data={analysisData.imageAnalysis} />
          </div>

          {/* Location Verification */}
          <div className="mb-10">
            <LocationVerification
              claimedLocation={analysisData.location}
              exifGPS={analysisData.imageAnalysis.exifData?.gps || { lat: 9.0088, lng: 38.7754 }}
              landmarks={['Modern city buildings', 'Elevated terrain', 'Contemporary architecture']}
              areaMedianPrice={25000}
              listedPrice={analysisData.price}
            />
          </div>

          {/* Escrow & Reputation */}
          <div className="mb-10">
            <EscrowFlow />
          </div>

          {/* Next Steps Info */}
          <div className="bg-[#d4af37]/5 border border-[#d4af37]/20 rounded-lg p-8">
            <h3 className="text-xl font-bold text-white mb-4">Risk Assessment Summary</h3>
            <p className="text-gray-300 mb-6">
              Based on this comprehensive analysis, multiple red flags were detected. We recommend proceeding with extreme caution. 
              The secure escrow feature provides essential protection if you choose to continue with viewing coordination.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-gray-400 font-semibold">Primary Concern</p>
                <p className="text-sm text-red-400 font-bold mt-1">Duplicate image listing</p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-gray-400 font-semibold">Secondary Concern</p>
                <p className="text-sm text-red-400 font-bold mt-1">Location mismatch</p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-gray-400 font-semibold">Price Alert</p>
                <p className="text-sm text-red-400 font-bold mt-1">40% below market</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}