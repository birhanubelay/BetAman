import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wallet = searchParams.get('wallet');
  
  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
  }
  
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('wallet_address, role, display_name, reputation_score')
    .eq('wallet_address', wallet)
    .single();
  
  if (error || !data) {
    return NextResponse.json({ role: null }); // New user
  }
  
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const { wallet_address, role, display_name } = await request.json();
    
    if (!wallet_address || !role) {
      return NextResponse.json({ error: 'Wallet and role required' }, { status: 400 });
    }
    
    // Upsert user (insert or update)
    const { data, error } = await supabaseAdmin
      .from('users')
      .upsert({
        wallet_address,
        role,
        display_name,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'wallet_address' })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Failed to save user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}