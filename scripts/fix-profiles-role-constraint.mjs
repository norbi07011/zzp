#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env');
  console.error('Required: VITE_SUPABASE_URL and (SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

console.log('🔧 FIX PROFILES ROLE CONSTRAINT');
console.log('================================\n');

async function fixProfilesRoleConstraint() {
  try {
    // KROK 1: Sprawdź obecne wartości role
    console.log('📊 KROK 1: Checking existing role values...');
    const { data: roleStats, error: statsError } = await supabase
      .from('profiles')
      .select('role')
      .then(result => {
        const stats = {};
        result.data?.forEach(p => {
          stats[p.role || 'NULL'] = (stats[p.role || 'NULL'] || 0) + 1;
        });
        return { data: stats, error: result.error };
      });

    if (statsError) {
      console.error('❌ Error:', statsError);
      process.exit(1);
    }

    console.log('Current role distribution:', roleStats);
    console.log('');

    // KROK 2: Pokaż nieprawidłowe profile
    console.log('🔍 KROK 2: Finding invalid profiles...');
    const { data: invalidProfiles, error: invalidError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .not('role', 'in', '(worker,employer,accountant)')
      .order('created_at', { ascending: false });

    if (invalidError) {
      console.error('❌ Error:', invalidError);
    } else if (invalidProfiles && invalidProfiles.length > 0) {
      console.log(`⚠️ Found ${invalidProfiles.length} invalid profiles:`);
      invalidProfiles.forEach(p => {
        console.log(`  - ${p.email}: role="${p.role}" (created: ${p.created_at})`);
      });
      console.log('');

      // KROK 3: Napraw nieprawidłowe wartości
      console.log('🔨 KROK 3: Fixing invalid role values...');
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'worker' })
        .not('role', 'in', '(worker,employer,accountant)');

      if (updateError) {
        console.error('❌ Error updating profiles:', updateError);
        process.exit(1);
      }
      console.log(`✅ Updated ${invalidProfiles.length} profiles to role='worker'`);
      console.log('');
    } else {
      console.log('✅ No invalid profiles found');
      console.log('');
    }

    // KROK 4: Napraw constraint przez SQL
    console.log('🔧 KROK 4: Updating CHECK constraint...');
    console.log('⚠️ NOTE: This requires database admin access (SQL Editor)');
    console.log('');
    console.log('Execute this SQL in Supabase SQL Editor:');
    console.log('─────────────────────────────────────────');
    console.log('ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;');
    console.log('');
    console.log('ALTER TABLE profiles');
    console.log('ADD CONSTRAINT profiles_role_check');
    console.log("CHECK (role IN ('worker', 'employer', 'accountant'));");
    console.log('─────────────────────────────────────────');
    console.log('');
    console.log('✅ Data cleanup complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Execute the SQL above in Supabase Dashboard');
    console.log('2. Delete user: ksiegowyy-test-2024@gmail.com (Dashboard → Authentication → Users)');
    console.log('3. Try registration again with a NEW email');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
fixProfilesRoleConstraint();
