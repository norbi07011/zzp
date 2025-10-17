// Reset and recreate test users
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const TEST_USERS = [
  { email: 'admin@zzp.nl', password: 'test123', role: 'admin', fullName: 'Admin User' },
  { email: 'employer@test.nl', password: 'test123', role: 'employer', fullName: 'Maria van Dijk' },
  { email: 'worker@test.nl', password: 'test123', role: 'worker', fullName: 'Jan de Vries' }
];

console.log('🔄 RESETTING TEST USERS...\n');

async function resetUsers() {
  for (const user of TEST_USERS) {
    console.log(`\n━━━ ${user.email} ━━━`);
    
    try {
      // 1. Get existing user
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(`  ⚠️  User exists, deleting...`);
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        if (deleteError) {
          console.log(`  ❌ Delete failed:`, deleteError.message);
          continue;
        }
        console.log(`  ✅ Deleted old user`);
        
        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // 2. Create new user
      console.log(`  📝 Creating new user...`);
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: user.email,
        password: user.password,
        user_metadata: {
          fullName: user.fullName,
          role: user.role
        },
        email_confirm: true
      });

      if (authError) {
        console.log(`  ❌ Creation failed:`, authError.message);
        continue;
      }

      console.log(`  ✅ Created auth user: ${authData.user.id.substring(0, 8)}...`);

      // 3. Create/update profile
      console.log(`  📝 Creating profile...`);
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: authData.user.id,
          email: user.email,
          full_name: user.fullName,
          role: user.role,
          is_premium: user.role === 'admin',
          language: 'nl'
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.log(`  ⚠️  Profile error:`, profileError.message);
      } else {
        console.log(`  ✅ Profile created`);
      }

      console.log(`  🎉 ${user.email} ready!`);
      
    } catch (error) {
      console.error(`  ❌ Error:`, error.message);
    }
  }

  console.log('\n\n🎯 ALL TEST CREDENTIALS:');
  console.log('━'.repeat(40));
  TEST_USERS.forEach(user => {
    console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
  });
  console.log('━'.repeat(40));
  console.log('\n🔗 Test at: http://localhost:3000/login\n');
}

resetUsers();
