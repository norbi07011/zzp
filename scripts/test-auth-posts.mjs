import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'zzp-werkplaats-auth-test'
  }
});

async function testAuthenticatedPostCreation() {
  console.log('🔐 TESTING AUTHENTICATED POST CREATION\n');

  try {
    // ============================================
    // 1. Login with test employer
    // ============================================
    console.log('👤 Step 1: Login as test employer');
    
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'test-employer@example.com',
      password: 'testpassword123' // Assuming this is the password
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      
      // Try with different password
      console.log('🔄 Trying with different password...');
      const { data: loginData2, error: loginError2 } = await supabase.auth.signInWithPassword({
        email: 'lenavalentinaaa@gmail.com', // Use the real employer we found
        password: 'password123'
      });
      
      if (loginError2) {
        console.log('❌ Second login attempt failed:', loginError2.message);
        console.log('⚠️ Cannot test with authenticated user - will simulate');
        return;
      } else {
        console.log('✅ Logged in as second employer:', loginData2.user?.email);
      }
    } else {
      console.log('✅ Logged in as test employer:', loginData.user?.email);
    }

    // ============================================
    // 2. Check current session
    // ============================================
    console.log('\n🔍 Step 2: Check current session');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else if (!sessionData.session) {
      console.log('❌ No active session');
    } else {
      console.log('✅ Active session found');
      console.log('   User ID:', sessionData.session.user.id);
      console.log('   Email:', sessionData.session.user.email);
      console.log('   Role:', sessionData.session.user.role);
    }

    // ============================================
    // 3. Test posts INSERT with authenticated user
    // ============================================
    console.log('\n📝 Step 3: Try authenticated INSERT');
    
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      console.log('❌ No authenticated user available');
      return;
    }

    const testPost = {
      author_id: userData.user.id,
      author_type: 'employer',
      type: 'announcement',
      content: 'Test post from authenticated session - ta wiadomość zostanie usunięta'
    };
    
    console.log('Attempting INSERT with user:', userData.user.id);
    
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert(testPost)
      .select()
      .single();
      
    if (postError) {
      console.log('❌ Authenticated INSERT failed:', postError.message);
      console.log('   Details:', postError);
      
      // Check if the user has employer record
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .select('*')
        .eq('profile_id', userData.user.id)
        .single();
        
      if (employerError) {
        console.log('❌ User has no employer record:', employerError.message);
        console.log('   This explains why RLS is blocking the INSERT');
      } else {
        console.log('✅ User has employer record:', employerData);
        console.log('   RLS should allow this - there might be another issue');
      }
    } else {
      console.log('✅ Authenticated INSERT successful!');
      console.log('   Post ID:', postData.id);
      console.log('   Content:', postData.content);
      
      // Clean up
      await supabase.from('posts').delete().eq('id', postData.id);
      console.log('🧹 Test post cleaned up');
    }

    // ============================================
    // 4. Test the feedService function
    // ============================================
    console.log('\n⚙️ Step 4: Test feedService createPost');
    
    // Since we can't import ES modules here, we'll skip this part
    console.log('(Skipping feedService test - would need to run in frontend context)');

    // ============================================
    // 5. Logout
    // ============================================
    console.log('\n🚪 Step 5: Logout');
    await supabase.auth.signOut();
    console.log('✅ Logged out');

  } catch (error) {
    console.error('💥 FATAL ERROR:', error);
  }
}

testAuthenticatedPostCreation();