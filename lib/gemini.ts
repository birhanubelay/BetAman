// lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use your existing ANTHROPIC_API_KEY (which is actually Gemini)
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey) {
  throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.1,
    maxOutputTokens: 8192, // Increased from 2048 to handle complete responses
  },
});

export interface FraudAnalysisInput {
  location: string;
  price: string;
  description: string;
  imageCount: number;
  exifSummary: {
    totalImages: number;
    imagesWithGps: number;
    strippedMetadata: number;
    anySuspicious: boolean;
  };
  priceAnalysis: {
    isReasonable: boolean;
    variancePercent: number;
    medianPrice: number;
  };
  locationVerification: {
    valid: boolean;
    distanceKm?: number;
  };
}

export interface FraudAnalysisResult {
  fraudScore: number;
  recommendation: 'approve' | 'review' | 'reject' | 'flag';
  riskFactors: string[];
  imageAuthenticity: {
    likelyOriginal: boolean;
    concerns: string[];
  };
  priceAnalysis: {
    isReasonable: boolean;
    marketNote: string;
    variancePercent: number;
  };
  locationConsistency: {
    matchesClaimed: boolean;
    note: string;
    gpsValidated: boolean;
  };
  aiConfidence: number;
}

// Helper function to extract JSON from Gemini response
function extractJSONFromResponse(text: string): any {
  console.log('Raw response length:', text.length);
  console.log('Raw response first 200 chars:', text.substring(0, 200));
  
  let cleaned = text.trim();
  
  // Remove markdown code block syntax
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  
  cleaned = cleaned.trim();
  
  // Try to find complete JSON object by counting braces
  let braceCount = 0;
  let jsonEndIndex = -1;
  
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') braceCount++;
    if (cleaned[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        jsonEndIndex = i;
        break;
      }
    }
  }
  
  if (jsonEndIndex !== -1) {
    const completeJson = cleaned.substring(0, jsonEndIndex + 1);
    try {
      return JSON.parse(completeJson);
    } catch (e) {
      console.warn('Failed to parse complete JSON:', e);
    }
  }
  
  // If no complete JSON found, try to find any JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse extracted JSON object:', e);
    }
  }
  
  // Return a default structure instead of throwing
  console.error('No valid JSON found, returning default');
  return {
    fraudScore: 50,
    recommendation: 'review',
    riskFactors: ['Analysis incomplete - manual review recommended'],
    imageAuthenticity: { likelyOriginal: true, concerns: ['Incomplete analysis'] },
    priceAnalysis: { isReasonable: true, marketNote: 'Analysis incomplete', variancePercent: 0 },
    locationConsistency: { matchesClaimed: true, note: 'Analysis incomplete', gpsValidated: false },
    aiConfidence: 30,
  };
}

export async function analyzePropertyFraud(input: FraudAnalysisInput): Promise<FraudAnalysisResult> {
  const prompt = `
You are a real estate fraud detection expert analyzing property listings in Addis Ababa, Ethiopia.

PROPERTY DETAILS:
- Claimed Location: ${input.location}
- Listed Price: ${input.price} ETB/month
- Description: ${input.description}
- Images Uploaded: ${input.imageCount} photos
- EXIF Summary: ${input.exifSummary.totalImages} total, ${input.exifSummary.imagesWithGps} with GPS, ${input.exifSummary.strippedMetadata} stripped metadata, suspicious: ${input.exifSummary.anySuspicious}
- Price Analysis: ${input.priceAnalysis.isReasonable ? 'Reasonable' : 'Suspicious'} (${input.priceAnalysis.variancePercent}% vs median ${input.priceAnalysis.medianPrice} ETB)
- Location Verification: ${input.locationVerification.valid ? 'Valid' : 'Invalid'}${input.locationVerification.distanceKm ? ` (distance: ${input.locationVerification.distanceKm.toFixed(2)}km)` : ''}

Provide a COMPLETE JSON response with all fields. Keep responses concise but complete.

Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "fraudScore": 75,
  "recommendation": "review",
  "riskFactors": ["factor1", "factor2"],
  "imageAuthenticity": {
    "likelyOriginal": true,
    "concerns": []
  },
  "priceAnalysis": {
    "isReasonable": true,
    "marketNote": "brief note",
    "variancePercent": 0
  },
  "locationConsistency": {
    "matchesClaimed": true,
    "note": "brief note",
    "gpsValidated": false
  },
  "aiConfidence": 85
}
`.trim();

  try {
    const result = await geminiModel.generateContent([prompt]);
    const response = result.response;
    const text = response.text();
    
    // Use the extraction helper (it will return default if parsing fails)
    const parsedResult = extractJSONFromResponse(text);
    
    // Ensure all required fields exist
    return {
      fraudScore: parsedResult.fraudScore ?? 50,
      recommendation: parsedResult.recommendation ?? 'review',
      riskFactors: parsedResult.riskFactors ?? [],
      imageAuthenticity: {
        likelyOriginal: parsedResult.imageAuthenticity?.likelyOriginal ?? true,
        concerns: parsedResult.imageAuthenticity?.concerns ?? [],
      },
      priceAnalysis: {
        isReasonable: parsedResult.priceAnalysis?.isReasonable ?? true,
        marketNote: parsedResult.priceAnalysis?.marketNote ?? 'Analysis complete',
        variancePercent: parsedResult.priceAnalysis?.variancePercent ?? 0,
      },
      locationConsistency: {
        matchesClaimed: parsedResult.locationConsistency?.matchesClaimed ?? true,
        note: parsedResult.locationConsistency?.note ?? 'Location verified',
        gpsValidated: parsedResult.locationConsistency?.gpsValidated ?? false,
      },
      aiConfidence: parsedResult.aiConfidence ?? 50,
    } as FraudAnalysisResult;
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    return {
      fraudScore: 50,
      recommendation: 'review',
      riskFactors: ['AI analysis failed - manual review recommended'],
      imageAuthenticity: { likelyOriginal: true, concerns: ['Analysis failed, manual review needed'] },
      priceAnalysis: { isReasonable: true, marketNote: 'Unable to verify', variancePercent: 0 },
      locationConsistency: { matchesClaimed: true, note: 'Unable to verify', gpsValidated: false },
      aiConfidence: 0,
    };
  }
}