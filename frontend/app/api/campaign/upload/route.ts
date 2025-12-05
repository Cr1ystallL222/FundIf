import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with the Service Role key (allows write access)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const campaignAddress = formData.get('campaignAddress') as string;

    if (!file || !campaignAddress) {
      return NextResponse.json({ error: 'Missing file or address' }, { status: 400 });
    }

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // UPLOAD TO SUPABASE
    // We name the file specifically as the address + .png
    // upsert: true overwrites it if they upload a new one
    const { data, error } = await supabase
      .storage
      .from('campaign-images')
      .upload(`${campaignAddress}.png`, fileBuffer, {
        contentType: 'image/png', // Force PNG for consistency or use file.type
        upsert: true 
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    // Construct the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('campaign-images')
      .getPublicUrl(`${campaignAddress}.png`);

    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}