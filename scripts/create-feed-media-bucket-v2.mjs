import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createFeedMediaBucket() {
  try {
    console.log('🚀 Creating feed-media bucket with service key...');
    
    // First check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('📁 Current buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.id} (public: ${bucket.public})`);
    });

    const feedMediaExists = buckets.some(b => b.id === 'feed-media');
    
    if (feedMediaExists) {
      console.log('✅ feed-media bucket already exists!');
      return;
    }

    // Create the bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('feed-media', {
      public: true,
      fileSizeLimit: 20971520, // 20MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/webp',
        'image/jpg',
        'image/gif',
        'video/mp4',
        'video/webm',
        'video/avi',
        'video/mov'
      ]
    });

    if (bucketError) {
      console.error('❌ Error creating bucket:', bucketError);
      
      // If bucket exists, that's OK
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket already exists, that\'s fine!');
        return;
      }
      return;
    }

    console.log('✅ feed-media bucket created successfully!', bucketData);

    // Verify creation
    const { data: newBuckets } = await supabase.storage.listBuckets();
    const createdBucket = newBuckets?.find(b => b.id === 'feed-media');
    
    if (createdBucket) {
      console.log('🎉 Verification: feed-media bucket is ready for use!');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createFeedMediaBucket();