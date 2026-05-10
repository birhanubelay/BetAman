'use client';

import { Card } from '@/components/ui/card';
import { MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface GPSCoordinates {
  lat: number;
  lng: number;
}

interface LocationVerificationProps {
  claimedLocation: string;
  exifGPS: GPSCoordinates;
  landmarks: string[];
  areaMedianPrice: number;
  listedPrice: number;
}

export default function LocationVerification({
  claimedLocation,
  exifGPS,
  landmarks,
  areaMedianPrice,
  listedPrice
}: LocationVerificationProps) {
  const addisAbabaDistricts: Record<string, { lat: number; lng: number; range: number }> = {
    'Bole': { lat: 9.0047, lng: 38.7469, range: 0.02 },
    'Summit': { lat: 9.0088, lng: 38.7754, range: 0.02 },
    'Sarbet': { lat: 8.9949, lng: 38.7688, range: 0.02 },
    'Kolfe': { lat: 9.0287, lng: 38.7246, range: 0.02 },
    'Yeka': { lat: 9.0429, lng: 38.7805, range: 0.02 },
    'Addis Ketema': { lat: 8.9858, lng: 38.7406, range: 0.02 }
  };

  const claimedArea = addisAbabaDistricts[claimedLocation] || addisAbabaDistricts['Bole'];
  const distance = Math.sqrt(
    Math.pow(exifGPS.lat - claimedArea.lat, 2) + 
    Math.pow(exifGPS.lng - claimedArea.lng, 2)
  ) * 111; // Approximate km per degree

  const isLocationMatch = distance < 2; // Within 2km

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Location Verification</h3>

      {/* Main Status */}
      <Card className={`${isLocationMatch ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border p-6`}>
        <div className="flex items-start gap-4">
          {isLocationMatch ? (
            <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          )}
          <div>
            <h4 className={`font-bold mb-2 ${isLocationMatch ? 'text-green-400' : 'text-red-400'}`}>
              {isLocationMatch ? 'Location Match Verified' : 'Location Mismatch Detected'}
            </h4>
            <p className="text-sm text-gray-300">
              {isLocationMatch
                ? `EXIF GPS data matches claimed location of ${claimedLocation} within acceptable range.`
                : `EXIF GPS indicates different location. Distance from claimed ${claimedLocation}: ${distance.toFixed(1)}km`}
            </p>
          </div>
        </div>
      </Card>

      {/* GPS Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <h4 className="font-bold text-white">Claimed Location</h4>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              <span className="text-gray-500">District: </span>
              <span className="font-semibold">{claimedLocation}</span>
            </p>
            <p className="text-xs text-gray-500 font-mono">
              {claimedArea.lat.toFixed(4)}°N, {claimedArea.lng.toFixed(4)}°E
            </p>
          </div>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <h4 className="font-bold text-white">EXIF GPS Data</h4>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-300">
              <span className="text-gray-500">Recorded: </span>
              <span className="font-semibold">{distance < 2 ? 'Summit/Sarbet Area' : 'Different District'}</span>
            </p>
            <p className="text-xs text-gray-500 font-mono">
              {exifGPS.lat.toFixed(4)}°N, {exifGPS.lng.toFixed(4)}°E
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Distance: <span className="font-bold">{distance.toFixed(1)}km</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Landmarks */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
        <h4 className="font-bold text-white mb-4">Landmark Recognition</h4>
        <div className="space-y-2">
          {landmarks.map((landmark, idx) => (
            <div key={idx} className="p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
              <p className="text-sm text-gray-300">{landmark}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">
          Visual landmarks identified in image analysis suggest location in {distance < 2 ? 'elevated urban area (matches Summit/Sarbet)' : 'different area than claimed'}
        </p>
      </Card>

      {/* Area Price Comparison */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
        <h4 className="font-bold text-white mb-4">Area Price Analysis</h4>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Area Median Price</p>
            <p className="text-2xl font-bold text-[#d4af37]">{areaMedianPrice.toLocaleString()} ETB</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-2">Listed Price</p>
            <p className="text-2xl font-bold text-white">{listedPrice.toLocaleString()} ETB</p>
          </div>
          <div className="p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
            <p className="text-xs text-gray-400 mb-2">Price Variance</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">
                {Math.round((listedPrice / areaMedianPrice - 1) * 100)}%
              </p>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                listedPrice < areaMedianPrice * 0.5 ? 'bg-red-500/20 text-red-400' :
                listedPrice < areaMedianPrice * 0.8 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {listedPrice < areaMedianPrice ? 'Below Market' : 'Above Market'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
