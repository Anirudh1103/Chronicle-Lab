import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://espfrijljdzvzfoeuieg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
  console.log('Using Supabase URL:', supabaseUrl);
  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log('--- SUPABASE BUCKETS ---');
  if (error) {
    console.error('Error listing buckets:', error.message);
  } else {
    console.log(JSON.stringify(buckets, null, 2));
    for (const b of buckets || []) {
      const { data: files } = await supabase.storage.from(b.name).list();
      console.log(`\nFiles in bucket "${b.name}":`, files?.map(f => f.name));
    }
  }
}

listAll().then(() => process.exit(0));
