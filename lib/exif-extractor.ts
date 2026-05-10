// lib/exif-extractor.ts
import exifr from 'exifr';

export interface EXIFResult {
  filename: string;
  gps?: { lat: number; lng: number; altitude?: number };
  device?: string;
  timestamp?: string;
  software?: string;
  isStripped: boolean;
}

export async function extractEXIFFromMultipleFiles(files: File[]): Promise<EXIFResult[]> {
  const results: EXIFResult[] = [];
  
  for (const file of files) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Parse EXIF data
      const exif = await exifr.parse(buffer, {
        gps: true,
        pick: ['GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'DateTimeOriginal', 'Make', 'Model', 'Software'],
      });
      
      // Convert GPS coordinates from EXIF format to decimal degrees
      let gps: EXIFResult['gps'] = undefined;
      if (exif?.GPSLatitude && exif?.GPSLongitude) {
        gps = {
          lat: convertGPSToDecimal(exif.GPSLatitude, exif.GPSLatitudeRef),
          lng: convertGPSToDecimal(exif.GPSLongitude, exif.GPSLongitudeRef),
          altitude: exif.GPSAltitude,
        };
      }
      
      results.push({
        filename: file.name,
        gps,
        device: exif?.Make || exif?.Model ? `${exif.Make || ''} ${exif.Model || ''}`.trim() : undefined,
        timestamp: exif?.DateTimeOriginal,
        software: exif?.Software,
        isStripped: !exif || Object.keys(exif).length === 0,
      });
    } catch (error) {
      console.warn(`Failed to extract EXIF from ${file.name}:`, error);
      results.push({
        filename: file.name,
        isStripped: true,
      });
    }
  }
  
  return results;
}

// Convert EXIF GPS format (degrees/minutes/seconds) to decimal degrees
function convertGPSToDecimal(gpsValue: any, gpsRef: string): number {
  if (!gpsValue || !Array.isArray(gpsValue)) return 0;
  
  const [degrees, minutes, seconds] = gpsValue;
  const decimal = degrees + minutes / 60 + seconds / 3600;
  
  // Southern/Western hemispheres are negative
  return (gpsRef === 'S' || gpsRef === 'W') ? -decimal : decimal;
}