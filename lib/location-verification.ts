// lib/location-verification.ts

// Addis Ababa district coordinates and boundaries
export const ADDIS_ABABA_DISTRICTS: Record<string, { lat: number; lng: number; range: number; medianPrice: number }> = {
  'Bole': { lat: 9.0047, lng: 38.7469, range: 0.02, medianPrice: 15000 },
  'Summit': { lat: 9.0088, lng: 38.7754, range: 0.02, medianPrice: 18000 },
  'Sarbet': { lat: 8.9949, lng: 38.7688, range: 0.02, medianPrice: 12000 },
  'Kolfe': { lat: 9.0287, lng: 38.7246, range: 0.02, medianPrice: 10000 },
  'Yeka': { lat: 9.0429, lng: 38.7805, range: 0.02, medianPrice: 14000 },
  'Addis Ketema': { lat: 8.9858, lng: 38.7406, range: 0.02, medianPrice: 11000 },
};

export const ADDIS_ABABA_BOUNDS = {
  north: 9.0300,
  south: 8.7800,
  east: 38.8200,
  west: 38.6500,
};

export function isWithinAddisAbaba(lat: number, lng: number): boolean {
  return (
    lat >= ADDIS_ABABA_BOUNDS.south &&
    lat <= ADDIS_ABABA_BOUNDS.north &&
    lng >= ADDIS_ABABA_BOUNDS.west &&
    lng <= ADDIS_ABABA_BOUNDS.east
  );
}

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function verifyLocation(
  claimedLocation: string,
  imageGpsLat?: number,
  imageGpsLng?: number
): Promise<{
  valid: boolean;
  message: string;
  details: {
    claimedCoords?: { lat: number; lng: number };
    distanceKm?: number;
    isWithinAddisAbaba: boolean;
  };
}> {
  const district = ADDIS_ABABA_DISTRICTS[claimedLocation] || ADDIS_ABABA_DISTRICTS['Bole'];
  const isWithinBounds = isWithinAddisAbaba(district.lat, district.lng);
  
  if (!isWithinBounds) {
    return {
      valid: false,
      message: `Location "${claimedLocation}" is outside Addis Ababa boundaries`,
      details: { isWithinAddisAbaba: false },
    };
  }
  
  if (imageGpsLat && imageGpsLng) {
    const distance = calculateDistance(imageGpsLat, imageGpsLng, district.lat, district.lng);
    
    if (distance > 2) {
      return {
        valid: false,
        message: `Location mismatch: Image GPS is ${distance.toFixed(2)}km from claimed location "${claimedLocation}"`,
        details: {
          claimedCoords: { lat: district.lat, lng: district.lng },
          distanceKm: distance,
          isWithinAddisAbaba: true,
        },
      };
    }
    
    return {
      valid: true,
      message: `Location verified: Image GPS matches "${claimedLocation}" (distance: ${distance.toFixed(2)}km)`,
      details: {
        claimedCoords: { lat: district.lat, lng: district.lng },
        distanceKm: distance,
        isWithinAddisAbaba: true,
      },
    };
  }
  
  return {
    valid: true,
    message: `Location "${claimedLocation}" is within Addis Ababa (no GPS to verify)`,
    details: {
      claimedCoords: { lat: district.lat, lng: district.lng },
      isWithinAddisAbaba: true,
    },
  };
}

export function analyzePrice(price: number, location: string): {
  isReasonable: boolean;
  variancePercent: number;
  medianPrice: number;
  message: string;
} {
  const medianPrice = ADDIS_ABABA_DISTRICTS[location]?.medianPrice || 15000;
  const variancePercent = ((price - medianPrice) / medianPrice) * 100;
  
  const isReasonable = variancePercent >= -30 && variancePercent <= 50;
  
  let message = '';
  if (variancePercent < -30) {
    message = `Price is ${Math.abs(Math.round(variancePercent))}% below median for ${location} - potential red flag`;
  } else if (variancePercent > 50) {
    message = `Price is ${Math.round(variancePercent)}% above median for ${location} - verify justification`;
  } else {
    message = `Price is within expected range for ${location}`;
  }
  
  return {
    isReasonable,
    variancePercent: Math.round(variancePercent),
    medianPrice,
    message,
  };
}

export function getMedianPrice(location: string): number {
  return ADDIS_ABABA_DISTRICTS[location]?.medianPrice || 15000;
}