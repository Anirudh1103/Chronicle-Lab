import dotenv from 'dotenv';
dotenv.config();
import prisma from './config/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://espfrijljdzvzfoeuieg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzcGZyaWpsamR6dnpmb2V1aWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxODcyNTAsImV4cCI6MjA1ODc2MzI1MH0.placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  console.log('=== INSPECTING MEDIA RECORDS & SUPABASE URLS ===');
  const allMedia = await prisma.media.findMany();
  console.log(`Total Media DB Records: ${allMedia.length}`);

  for (const m of allMedia) {
    const fn = m.path;
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${fn}`;
    console.log(`ID: ${m.id} | filename: ${m.filename} | path: ${m.path}`);
    console.log(`   Public URL: ${publicUrl}`);
  }
}

inspect().then(() => process.exit(0)).catch(console.error);
