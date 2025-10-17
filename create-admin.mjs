// Create test admin user programmatically
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 CREATING TEST ADMIN USER...');

async function createTestUser() {
  try {
    // Create admin user  
    console.log('1. Creating admin user in auth...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@zzp.nl',
      password: 'test123',
      user_metadata: {
        fullName: 'Admin User',
        role: 'admin'
      },
      email_confirm: true
    });

    if (authError) {
      console.log('❌ Auth user creation failed:', authError.message);
      return;
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Create profile
    console.log('2. Creating user profile...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: 'admin@zzp.nl',
        full_name: 'Admin User',
        role: 'admin',
        is_premium: true,
        language: 'nl'
      });

    if (profileError) {
      console.log('❌ Profile creation failed:', profileError.message);
    } else {
      console.log('✅ Profile created successfully');
    }

    console.log('\n🎯 TEST CREDENTIALS:');
    console.log('Email: admin@zzp.nl');
    console.log('Password: test123');
    console.log('\n🔗 Test login at: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ User creation failed:', error);
  }
}

createTestUser();