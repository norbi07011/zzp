import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function checkRLSPoliciesSimple() {
  console.log('🔍 SIMPLE RLS POLICY CHECK\n');

  try {
    // ============================================
    // 1. Check if posts table exists and has RLS
    // ============================================
    console.log('📋 Step 1: Table info');
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename, schemaname')
      .eq('tablename', 'posts');
      
    if (tablesError) {
      console.log('❌ Cannot check pg_tables:', tablesError.message);
    } else {
      console.log('✅ Posts table exists:', tables);
    }

    // ============================================
    // 2. Check our test data
    // ============================================
    console.log('\n👤 Step 2: Check test employer');
    const testEmployerId = 'e15f1bef-4268-49c4-ad4f-788494342b9d';
    
    const { data: testProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', testEmployerId)
      .single();
      
    if (profileError) {
      console.log('❌ Cannot find test profile:', profileError.message);
    } else {
      console.log('✅ Test profile:', testProfile);
    }

    const { data: testEmployer, error: employerError } = await supabase
      .from('employers')
      .select('*')
      .eq('profile_id', testEmployerId)
      .single();
      
    if (employerError) {
      console.log('❌ Cannot find employer record:', employerError.message);
    } else {
      console.log('✅ Employer record:', testEmployer);
    }

    // ============================================
    // 3. Try INSERT with service key (should work)
    // ============================================
    console.log('\n🔧 Step 3: Test INSERT with service key');
    
    const testPost = {
      author_id: testEmployerId,
      author_type: 'employer',
      type: 'announcement',
      content: 'Service key test post'
    };
    
    const { data: serviceInsert, error: serviceError } = await supabase
      .from('posts')
      .insert(testPost)
      .select()
      .single();
      
    if (serviceError) {
      console.log('❌ Service key INSERT failed:', serviceError.message);
      console.log('   Details:', serviceError);
    } else {
      console.log('✅ Service key INSERT successful:', serviceInsert.id);
      
      // Clean up
      await supabase.from('posts').delete().eq('id', serviceInsert.id);
      console.log('🧹 Cleaned up test post');
    }

    // ============================================
    // 4. Test with anon key (this should fail due to RLS)
    // ============================================
    console.log('\n🔐 Step 4: Test INSERT with anon key (expected to fail)');
    
    const anonSupabase = createClient(supabaseUrl, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw');
    
    const { data: anonInsert, error: anonError } = await anonSupabase
      .from('posts')
      .insert(testPost)
      .select()
      .single();
      
    if (anonError) {
      console.log('❌ Anon INSERT failed (expected):', anonError.message);
      console.log('   This confirms RLS is working and blocking unauthenticated users');
    } else {
      console.log('⚠️ Anon INSERT worked - RLS might be misconfigured!');
    }

    // ============================================
    // 5. Test what frontend sees
    // ============================================
    console.log('\n🌐 Step 5: Simulate frontend scenario');
    
    // The frontend should authenticate first, then try to post
    console.log('The issue is: Frontend tries to INSERT without proper authentication');
    console.log('RLS policies probably require auth.uid() to match author_id');
    console.log('But the frontend session might not be properly established');

    // ============================================
    // 6. Check existing posts (should be readable)
    // ============================================
    console.log('\n📖 Step 6: Check existing posts');
    
    const { data: existingPosts, error: readError } = await supabase
      .from('posts')
      .select('*')
      .limit(3);
      
    if (readError) {
      console.log('❌ Cannot read posts:', readError.message);
    } else {
      console.log(`✅ Found ${existingPosts.length} existing posts`);
      existingPosts.forEach(post => {
        console.log(`   - ${post.content.substring(0, 50)}... by ${post.author_id}`);
      });
    }

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
  }
}

checkRLSPoliciesSimple();