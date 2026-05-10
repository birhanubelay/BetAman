'use client';

import { Card } from '@/components/ui/card';
import { Image as ImageIcon, MapPin, Camera, Clock, Info } from 'lucide-react';

interface ImageAnalysisData {
  exifStatus: 'available' | 'stripped';
  exifData?: {
    gps?: { lat: number; lng: number; altitude?: number };
    device?: string;
    timestamp?: string;
    software?: string;
  };
  screenshotDetected: boolean;
  photoOfPhotoDetected: boolean;
  perceptualHash: string;
  hashMatches: Array<{ image_id: string; similarity: number }>;
  compressionLevel: 'low' | 'normal' | 'high';
}

export default function ImageAnalysisPanel({ data }: { data: ImageAnalysisData }) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">Image Analysis Details</h3>

      {/* EXIF Data */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-[#d4af37]" />
          <h4 className="font-bold text-white">EXIF Metadata</h4>
        </div>

        {data.exifStatus === 'stripped' ? (
          <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
            <p className="text-sm text-gray-300">
              EXIF data has been stripped from this image. This could indicate:
            </p>
            <ul className="mt-2 text-xs text-gray-400 space-y-1">
              <li>• Image was edited or re-saved</li>
              <li>• Intentional removal to hide metadata</li>
              <li>• Processed through image compression tools</li>
            </ul>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.exifData?.gps && (
              <div className="p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-[#d4af37]" />
                  <p className="text-xs text-gray-400 font-semibold">GPS COORDINATES</p>
                </div>
                <p className="text-sm font-mono text-white">
                  {data.exifData.gps.lat.toFixed(4)}°N, {data.exifData.gps.lng.toFixed(4)}°E
                </p>
                {data.exifData.gps.altitude && (
                  <p className="text-xs text-gray-400 mt-1">Altitude: {data.exifData.gps.altitude}m</p>
                )}
              </div>
            )}
            {data.exifData?.device && (
              <div className="p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
                <p className="text-xs text-gray-400 font-semibold mb-2">DEVICE</p>
                <p className="text-sm text-white">{data.exifData.device}</p>
              </div>
            )}
            {data.exifData?.timestamp && (
              <div className="p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#d4af37]" />
                  <p className="text-xs text-gray-400 font-semibold">CAPTURED</p>
                </div>
                <p className="text-sm text-white">{data.exifData.timestamp}</p>
              </div>
            )}
            {data.exifData?.software && (
              <div className="p-4 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
                <p className="text-xs text-gray-400 font-semibold mb-2">SOFTWARE</p>
                <p className="text-sm text-white">{data.exifData.software}</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Screenshot & Manipulation Detection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
          <h4 className="font-bold text-white mb-4">Screenshot Detection</h4>
          <div className={`p-4 rounded-lg border ${data.screenshotDetected ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
            <p className={data.screenshotDetected ? 'text-red-400' : 'text-green-400'}>
              {data.screenshotDetected ? '⚠️ Screenshot Detected' : '✓ Original Photo'}
            </p>
            {data.screenshotDetected && (
              <p className="text-xs text-gray-400 mt-2">
                Image appears to be a screenshot rather than a native camera photo. This may indicate intentional image manipulation.
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
          <h4 className="font-bold text-white mb-4">Photo-of-Photo Detection</h4>
          <div className={`p-4 rounded-lg border ${data.photoOfPhotoDetected ? 'bg-red-500/10 border-red-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
            <p className={data.photoOfPhotoDetected ? 'text-red-400' : 'text-green-400'}>
              {data.photoOfPhotoDetected ? '⚠️ Photo-of-Photo Detected' : '✓ Direct Photo'}
            </p>
            {data.photoOfPhotoDetected && (
              <p className="text-xs text-gray-400 mt-2">
                Image may be a photo of a printed or displayed photo, indicating potential manipulation or reuse.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Compression Analysis */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
        <h4 className="font-bold text-white mb-4">Image Quality Analysis</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-400">Compression Level</p>
              <span className={`text-xs font-bold px-2 py-1 rounded ${
                data.compressionLevel === 'low' ? 'bg-green-500/20 text-green-400' :
                data.compressionLevel === 'normal' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {data.compressionLevel.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {data.compressionLevel === 'low' && 'Image is high-quality with minimal compression artifacts.'}
              {data.compressionLevel === 'normal' && 'Image has standard compression, typical of camera photos.'}
              {data.compressionLevel === 'high' && 'Image is heavily compressed, suggesting possible re-saving or heavy editing.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Perceptual Hash */}
      <Card className="bg-[#1a1a1a] border-[#2d2d2d] p-6">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="w-5 h-5 text-[#d4af37]" />
          <h4 className="font-bold text-white">Image Fingerprinting</h4>
        </div>
        <p className="text-xs text-gray-400 mb-3">Perceptual Hash</p>
        <div className="p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a] font-mono text-xs text-white mb-4">
          {data.perceptualHash}
        </div>

        {data.hashMatches.length > 0 ? (
          <div>
            <p className="text-xs text-gray-400 font-semibold mb-3">
              Similar Images Found: {data.hashMatches.length}
            </p>
            <div className="space-y-2">
              {data.hashMatches.map((match, idx) => (
                <div key={idx} className="p-3 bg-[#2d2d2d] rounded-lg border border-[#3a3a3a]">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-300 font-mono">{match.image_id}</p>
                    <span className="text-xs font-bold text-[#d4af37]">
                      {Math.round(match.similarity * 100)}% match
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#d4af37]"
                      style={{ width: `${match.similarity * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-green-400">No similar images found in database.</p>
        )}
      </Card>
    </div>
  );
}
