import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://espfrijljdzvzfoeuieg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY provided?:', !!supabaseKey);

if (!supabaseKey) {
  console.error('ERROR: Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set in .env!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Listing buckets...');
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Failed to list buckets:', error);
  } else {
    console.log('Buckets found:', buckets.map(b => b.name));
  }

  // Ensure 'media' bucket exists and is public
  const { data: mediaBucket, error: getErr } = await supabase.storage.getBucket('media');
  if (getErr || !mediaBucket) {
    console.log('Bucket "media" does not exist. Creating public "media" bucket...');
    const { data: newBucket, error: createErr } = await supabase.storage.createBucket('media', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'],
    });
    if (createErr) {
      console.error('Failed to create "media" bucket:', createErr);
    } else {
      console.log('Successfully created public "media" bucket!', newBucket);
    }
  } else {
    console.log('Public "media" bucket already exists!');
  }
}

run().then(() => process.exit(0));
