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
    temperature: 0.1, // Low temperature for consistent, factual analysis
    maxOutputTokens: 2048,
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
  fraudScore: number; // 0-100, higher = more trustworthy
  recommendation: 'approve' | 'review' | 'reject';
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
  aiConfidence: number; // 0-100
}

export async function analyzePropertyFraud(input: FraudAnalysisInput): Promise<FraudAnalysisResult> {
  const prompt = `
You are a real estate fraud detection expert analyzing property listings in Addis Ababa, Ethiopia.

PROPERTY DETAILS:
- Claimed Location: ${input.location}
- Listed Price: ${input.price} ETB/month
- Description: ${input.description}
- Images Uploaded: ${input.imageCount} photos
- EXIF Summary: ${input.imageCount} total, ${input.exifSummary.imagesWithGps} with GPS, ${input.exifSummary.strippedMetadata} stripped metadata, suspicious: ${input.exifSummary.anySuspicious}
- Price Analysis: ${input.priceAnalysis.isReasonable ? 'Reasonable' : 'Suspicious'} (${input.priceAnalysis.variancePercent}% vs median ${input.priceAnalysis.medianPrice} ETB)
- Location Verification: ${input.locationVerification.valid ? 'Valid' : 'Invalid'}${input.locationVerification.distanceKm ? ` (distance: ${input.locationVerification.distanceKm.toFixed(2)}km)` : ''}

ANALYZE FOR FRAUD INDICATORS:

1. **Image Authenticity**:
   - Are images likely original photos or stock/screenshot/manipulated?
   - Check for: compression artifacts, editing software traces, AI generation signs
   - Red flag if metadata stripped or suspicious software detected

2. **Location Consistency**:
   - Does claimed location (${input.location}) match typical pricing?
   - If GPS available, is it within Addis Ababa bounds and near claimed district?
   - Distance tolerance: 2km from claimed district center

3. **Price Anomaly Detection**:
   - Is price suspiciously low/high for ${input.location}?
   - Red flag if >30% below median or >50% above median

4. **Description Red Flags**:
   - Urgency tactics ("must rent today", "limited time", "act now")
   - Vague details, copy-paste text, contradictions with images/location

RETURN STRICT JSON with this exact schema (no markdown, no extra text):
{
  "fraudScore": number (0-100, higher = more trustworthy),
  "recommendation": "approve" | "review" | "reject",
  "riskFactors": string[],
  "imageAuthenticity": {
    "likelyOriginal": boolean,
    "concerns": string[]
  },
  "priceAnalysis": {
    "isReasonable": boolean,
    "marketNote": string,
    "variancePercent": number
  },
  "locationConsistency": {
    "matchesClaimed": boolean,
    "note": string,
    "gpsValidated": boolean
  },
  "aiConfidence": number (0-100)
}

Be concise, factual, and prioritize user safety. If uncertain, recommend "review".
`.trim();

  try {
    const result = await geminiModel.generateContent([prompt]);
    const response = result.response;
    const text = response.text();
    
    // Extract JSON from response (handle potential markdown code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini analysis failed:', error);
    // Return safe default on error
    return {
      fraudScore: 50,
      recommendation: 'review',
      riskFactors: ['AI analysis failed - manual review recommended'],
      imageAuthenticity: { likelyOriginal: true, concerns: [] },
      priceAnalysis: { isReasonable: true, marketNote: 'Unable to verify', variancePercent: 0 },
      locationConsistency: { matchesClaimed: true, note: 'Unable to verify', gpsValidated: false },
      aiConfidence: 0,
    };
  }
}