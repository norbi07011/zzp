import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyODcwMTQ2MSwiZXhwIjoyMDQ0Mjc3NDYxfQ.f6f3G3gzPj87FhC5jfx0yurUXXrfLp4VnD0M9BQ0kJM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createFeedMediaBucket() {
  try {
    console.log('🚀 Creating feed-media bucket...');
    
    // Try to create the bucket
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

    if (bucketError && bucketError.message !== 'Bucket already exists') {
      console.error('❌ Error creating bucket:', bucketError);
      return;
    }

    console.log('✅ Bucket created/verified:', bucketData || 'Already exists');

    // List all buckets to verify
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('📁 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.id} (public: ${bucket.public})`);
    });

    // Check if feed-media bucket exists
    const feedMediaBucket = buckets.find(b => b.id === 'feed-media');
    if (feedMediaBucket) {
      console.log('✅ feed-media bucket is ready!');
    } else {
      console.log('❌ feed-media bucket not found');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createFeedMediaBucket();