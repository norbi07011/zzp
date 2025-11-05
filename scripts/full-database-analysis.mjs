import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fullDatabaseAnalysis() {
  console.log('🔍 FULL DATABASE ANALYSIS - STEP BY STEP\n');
  
  const analysis = {
    timestamp: new Date().toISOString(),
    checks: {},
    errors: [],
    recommendations: []
  };

  try {
    // ============================================
    // STEP 1: Check authentication status
    // ============================================
    console.log('👤 STEP 1: Authentication Status');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message);
      analysis.checks.auth = { status: 'error', error: authError.message };
    } else if (!user) {
      console.log('⚠️ No authenticated user');
      analysis.checks.auth = { status: 'no_user' };
    } else {
      console.log('✅ User authenticated:', user.email);
      analysis.checks.auth = { status: 'authenticated', user: user.email, id: user.id };
    }

    // ============================================
    // STEP 2: Test basic table access
    // ============================================
    console.log('\n📋 STEP 2: Testing Table Access');
    
    const tablesToCheck = ['profiles', 'employers', 'accountants', 'posts', 'post_likes', 'post_comments'];
    
    for (const tableName of tablesToCheck) {
      try {
        console.log(`  Testing ${tableName}...`);
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .limit(1);
          
        if (error) {
          console.log(`  ❌ ${tableName}: ${error.message}`);
          analysis.checks[tableName] = { 
            status: 'error', 
            error: error.message,
            code: error.code 
          };
        } else {
          console.log(`  ✅ ${tableName}: ${count} records`);
          analysis.checks[tableName] = { 
            status: 'success', 
            count: count,
            sample: data?.[0] ? Object.keys(data[0]) : []
          };
        }
      } catch (err) {
        console.log(`  💥 ${tableName}: ${err.message}`);
        analysis.checks[tableName] = { status: 'exception', error: err.message };
      }
    }

    // ============================================
    // STEP 3: Check specific profiles data
    // ============================================
    console.log('\n👥 STEP 3: Profiles Analysis');
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (profilesError) {
        console.log('❌ Cannot read profiles:', profilesError.message);
        analysis.checks.profiles_detailed = { status: 'error', error: profilesError.message };
      } else {
        console.log(`✅ Found ${profiles.length} profiles:`);
        profiles.forEach(p => {
          console.log(`  - ${p.email} (${p.role}) - ${p.id}`);
        });
        analysis.checks.profiles_detailed = { 
          status: 'success', 
          profiles: profiles,
          roles: profiles.map(p => p.role)
        };
      }
    } catch (err) {
      console.log('💥 Profiles exception:', err.message);
      analysis.checks.profiles_detailed = { status: 'exception', error: err.message };
    }

    // ============================================
    // STEP 4: Check employers <-> profiles mapping
    // ============================================
    console.log('\n🏢 STEP 4: Employers Mapping');
    
    try {
      const { data: employers, error: employersError } = await supabase
        .from('employers')
        .select(`
          id,
          profile_id,
          company_name,
          profiles!inner(email, role)
        `)
        .limit(5);
        
      if (employersError) {
        console.log('❌ Cannot read employers:', employersError.message);
        analysis.checks.employers_mapping = { status: 'error', error: employersError.message };
      } else {
        console.log(`✅ Found ${employers.length} employers with profiles:`);
        employers.forEach(e => {
          console.log(`  - ${e.company_name} → ${e.profiles.email} (${e.profile_id})`);
        });
        analysis.checks.employers_mapping = { status: 'success', employers: employers };
      }
    } catch (err) {
      console.log('💥 Employers exception:', err.message);
      analysis.checks.employers_mapping = { status: 'exception', error: err.message };
    }

    // ============================================
    // STEP 5: Test posts table INSERT permission
    // ============================================
    console.log('\n📝 STEP 5: Posts INSERT Test');
    
    // Get a valid employer ID for testing
    const { data: testEmployer } = await supabase
      .from('employers')
      .select('profile_id')
      .limit(1)
      .single();
      
    if (testEmployer) {
      console.log(`Testing with employer profile_id: ${testEmployer.profile_id}`);
      
      const testPost = {
        author_id: testEmployer.profile_id,
        author_type: 'employer',
        type: 'announcement',
        content: 'TEST POST - będzie usunięty'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('posts')
        .insert(testPost)
        .select()
        .single();
        
      if (insertError) {
        console.log('❌ Cannot insert post:', insertError.message);
        console.log('   Error details:', insertError);
        analysis.checks.posts_insert = { 
          status: 'error', 
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        };
      } else {
        console.log('✅ Post inserted successfully:', insertData.id);
        analysis.checks.posts_insert = { status: 'success', post_id: insertData.id };
        
        // Clean up test post
        await supabase.from('posts').delete().eq('id', insertData.id);
        console.log('🧹 Test post cleaned up');
      }
    } else {
      console.log('⚠️ No employers found for testing');
      analysis.checks.posts_insert = { status: 'no_test_data' };
    }

    // ============================================
    // STEP 6: Check RLS policies (indirect)
    // ============================================
    console.log('\n🔒 STEP 6: RLS Policy Analysis');
    
    // Test authenticated vs unauthenticated access
    const { data: postsAuth, error: postsAuthError } = await supabase
      .from('posts')
      .select('*')
      .limit(1);
      
    analysis.checks.rls_analysis = {
      authenticated_access: postsAuthError ? {
        status: 'error',
        error: postsAuthError.message
      } : {
        status: 'success',
        count: postsAuth.length
      }
    };

    // ============================================
    // STEP 7: Check feedService.ts functionality
    // ============================================
    console.log('\n⚙️ STEP 7: FeedService Test');
    
    try {
      // Import and test feedService
      const { getPosts } = await import('../src/services/feedService.js');
      const posts = await getPosts();
      
      console.log(`✅ FeedService getPosts(): ${posts.length} posts`);
      analysis.checks.feed_service = { status: 'success', posts_count: posts.length };
    } catch (err) {
      console.log('❌ FeedService error:', err.message);
      analysis.checks.feed_service = { status: 'error', error: err.message };
    }

    // ============================================
    // SAVE RESULTS
    // ============================================
    mkdirSync('.tmp', { recursive: true });
    writeFileSync('.tmp/full-analysis.json', JSON.stringify(analysis, null, 2));
    
    console.log('\n📊 ANALYSIS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    Object.entries(analysis.checks).forEach(([key, check]) => {
      const status = check.status === 'success' ? '✅' : 
                   check.status === 'error' ? '❌' : '⚠️';
      console.log(`${status} ${key}: ${check.status}`);
      if (check.error) {
        console.log(`   Error: ${check.error}`);
      }
    });
    
    console.log('\n💾 Full analysis saved to .tmp/full-analysis.json');
    
  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
    analysis.errors.push({ type: 'fatal', message: error.message, stack: error.stack });
  }
}

fullDatabaseAnalysis();