import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjg3MDE0NjEsImV4cCI6MjA0NDI3NzQ2MX0.eamCMLj6VhGGftOuWAJ8aWEsUAzCDRFhM5QCJCPxLOM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMediaUpload() {
  try {
    console.log('🧪 Testing media upload functionality...');

    // Test 1: Check if we can access storage at all
    console.log('\n1. Testing storage access...');
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.log('❌ Cannot list buckets:', bucketsError.message);
      } else {
        console.log('✅ Storage accessible, found buckets:', buckets?.map(b => b.id));
      }
    } catch (e) {
      console.log('❌ Storage API error:', e.message);
    }

    // Test 2: Try to upload to a known bucket (avatars - should exist)
    console.log('\n2. Testing upload to avatars bucket...');
    
    // Create a simple test file (1x1 pixel PNG)
    const testImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA60e6kgAAAABJRU5ErkJggg==';
    const testImageBuffer = Uint8Array.from(atob(testImageData), c => c.charCodeAt(0));
    const testFile = new File([testImageBuffer], 'test.png', { type: 'image/png' });

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`test-${Date.now()}.png`, testFile);

    if (uploadError) {
      console.log('❌ Upload to avatars failed:', uploadError.message);
      
      // Check if the issue is that avatars bucket doesn't exist
      if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
        console.log('🔍 Avatars bucket might not exist');
      }
    } else {
      console.log('✅ Upload to avatars succeeded:', uploadData.path);
      
      // Clean up test file
      await supabase.storage.from('avatars').remove([uploadData.path]);
      console.log('🧹 Test file cleaned up');
    }

    // Test 3: Try to create feed-media bucket using INSERT
    console.log('\n3. Testing feed-media bucket creation...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('storage.buckets')
      .insert({
        id: 'feed-media',
        name: 'feed-media',
        public: true,
        file_size_limit: 20971520, // 20MB
        allowed_mime_types: [
          'image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif',
          'video/mp4', 'video/webm', 'video/avi', 'video/mov'
        ]
      });

    if (insertError) {
      console.log('❌ Bucket creation via INSERT failed:', insertError.message);
      
      if (insertError.message.includes('already exists')) {
        console.log('✅ feed-media bucket already exists!');
      }
    } else {
      console.log('✅ feed-media bucket created via INSERT:', insertData);
    }

    // Test 4: Try to upload to feed-media bucket
    console.log('\n4. Testing upload to feed-media bucket...');
    
    const { data: feedUpload, error: feedError } = await supabase.storage
      .from('feed-media')
      .upload(`test-${Date.now()}.png`, testFile);

    if (feedError) {
      console.log('❌ Upload to feed-media failed:', feedError.message);
    } else {
      console.log('✅ Upload to feed-media succeeded:', feedUpload.path);
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('feed-media')
        .getPublicUrl(feedUpload.path);
      
      console.log('🔗 Public URL:', publicUrl);
      
      // Clean up
      await supabase.storage.from('feed-media').remove([feedUpload.path]);
      console.log('🧹 Test file cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error during testing:', error);
  }
}

testMediaUpload();