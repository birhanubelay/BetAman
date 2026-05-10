// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractEXIFFromMultipleFiles } from '@/lib/exif-extractor';
import { verifyLocation, analyzePrice, getMedianPrice } from '@/lib/location-verification';
import { analyzePropertyFraud } from '@/lib/gemini';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const location = formData.get('location') as string;
    const price = formData.get('price') as string;
    const description = formData.get('description') as string;
    const images = formData.getAll('images') as File[];
    
    if (!location || !price || !description || images.length === 0) {
      return NextResponse.json(
        { error: 'Location, price, description, and at least one image are required' },
        { status: 400 }
      );
    }
    
    // Step 1: Upload images to Supabase Storage
    const imageUrls: string[] = [];
    const uploadTimestamp = Date.now();
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const fileExt = image.name.split('.').pop();
      const fileName = `${uploadTimestamp}_${i}_${uuidv4()}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('property-images')
        .upload(fileName, image, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) {
        console.error('Image upload failed:', uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('property-images')
        .getPublicUrl(fileName);
      
      imageUrls.push(publicUrl);
    }
    
    // Step 2: Extract EXIF data from all images
    const exifResults = await extractEXIFFromMultipleFiles(images);
    const exifSummary = {
      totalImages: images.length,
      imagesWithGps: exifResults.filter((e: any) => e.gps).length,
      strippedMetadata: exifResults.filter((e: any) => e.isStripped).length,
      anySuspicious: exifResults.some((e: any) => 
        e.isStripped || 
        (e.software && !e.software.toLowerCase().includes('camera'))
      ),
    };
    
    // Step 3: Verify location claim
    const firstImageWithGps = exifResults.find((e: any) => e.gps);
    const locationVerification = await verifyLocation(
      location,
      firstImageWithGps?.gps?.lat,
      firstImageWithGps?.gps?.lng
    );
    
    // Step 4: Analyze price anomaly
    const priceValue = parseInt(price, 10);
    const priceAnalysis = analyzePrice(priceValue, location);
    
    // Step 5: Run Gemini AI fraud analysis
    const aiAnalysis = await analyzePropertyFraud({
      location,
      price,
      description,
      imageCount: images.length,
      exifSummary,
      priceAnalysis,
      locationVerification: {
        valid: locationVerification.valid,
        distanceKm: locationVerification.details.distanceKm,
      },
    });
    
    // Step 6: Compile complete analysis
    const completeAnalysis = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      input: {
        location,
        price: priceValue,
        description,
        imageCount: images.length,
      },
      imageUrls, // ✅ Save uploaded image URLs
      exifSummary,
      locationVerification,
      priceAnalysis,
      aiAnalysis,
      finalRecommendation: aiAnalysis.recommendation,
      fraudScore: aiAnalysis.fraudScore,
    };
    
    // Step 7: Save to Supabase (audit trail)
    const { error: dbError } = await supabaseAdmin
      .from('property_analyses')
      .insert({
        id: completeAnalysis.id,
        location,
        price: priceValue,
        description,
        image_count: images.length,
        image_urls: imageUrls, // ✅ Store image URLs
        exif_summary: exifSummary,
        location_verification: locationVerification,
        price_analysis: priceAnalysis,
        ai_analysis: aiAnalysis,
        final_recommendation: aiAnalysis.recommendation,
        fraud_score: aiAnalysis.fraudScore,
        created_at: new Date().toISOString(),
      });
    
    if (dbError) {
      console.warn('Failed to save analysis to Supabase:', dbError);
      // Continue anyway - analysis still valid
    }
    
    // Step 8: Return result
    return NextResponse.json({
      success: true,
      analysisId: completeAnalysis.id,
      analysis: completeAnalysis,
      message: 'Fraud analysis completed successfully',
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Analysis pipeline failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Analysis failed',
        analysisId: null,
      },
      { status: 500 }
    );
  }
}