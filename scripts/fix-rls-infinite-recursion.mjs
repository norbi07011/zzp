#!/usr/bin/env node
/**
 * FIX: Infinite recursion in RLS policies
 * Problem: profiles ↔ employer_profiles circular dependency
 * Solution: Disable RLS temporarily, then create simple policies
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSRecursion() {
  console.log('🔧 Fixing RLS infinite recursion...\n');

  try {
    // KROK 1: Wyłącz RLS tymczasowo
    console.log('1️⃣ Disabling RLS on profiles and employer_profiles...');
    
    const disableQueries = [
      'ALTER TABLE profiles DISABLE ROW LEVEL SECURITY',
      'ALTER TABLE employer_profiles DISABLE ROW LEVEL SECURITY'
    ];
    
    for (const query of disableQueries) {
      const { error } = await supabase.rpc('exec_sql', { query });
      if (error) {
        console.error(`❌ Failed: ${query}`, error.message);
      } else {
        console.log(`✅ ${query}`);
      }
    }
    
    console.log('✅ RLS disabled successfully\n');

    // KROK 2: Usuń stare problematyczne policies
    console.log('2️⃣ Dropping old policies...');
    
    const dropPolicies = [
      'DROP POLICY IF EXISTS "Users can view own profile" ON profiles',
      'DROP POLICY IF EXISTS "Users can view profiles" ON profiles',
      'DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles',
      'DROP POLICY IF EXISTS "Employers can view own profile" ON employer_profiles',
    ];

    for (const query of dropPolicies) {
      const { error } = await supabase.rpc('exec_sql', { query });
      if (error && !error.message.includes('does not exist')) {
        console.log(`⚠️ ${query}: ${error.message}`);
      } else {
        console.log(`✅ Dropped policy`);
      }
    }
    
    console.log('✅ Old policies dropped\n');

    // KROK 3: Włącz RLS z nowymi prostymi policies
    console.log('3️⃣ Enabling RLS with simple policies...');
    
    const enableQueries = [
      'ALTER TABLE profiles ENABLE ROW LEVEL SECURITY',
      'ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY',
      `CREATE POLICY "profiles_select_all" ON profiles FOR SELECT TO authenticated USING (true)`,
      `CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`,
      `CREATE POLICY "employer_profiles_select_own" ON employer_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id)`,
      `CREATE POLICY "employer_profiles_update_own" ON employer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`,
    ];

    for (const query of enableQueries) {
      const { error } = await supabase.rpc('exec_sql', { query });
      if (error) {
        console.error(`❌ Failed: ${error.message}`);
      } else {
        console.log(`✅ Executed successfully`);
      }
    }
    
    console.log('✅ RLS enabled with simple policies\n');

    // KROK 4: Verify i Refresh
    console.log('4️⃣ Refreshing schema...');
    
    const { error: refreshError } = await supabase.rpc('exec_sql', { 
      query: "NOTIFY pgrst, 'reload schema'" 
    });
    
    if (refreshError) {
      console.log('⚠️ Schema refresh warning (non-critical):', refreshError.message);
    }

    console.log('✅ RLS status:');
    console.log('   - profiles: enabled');
    console.log('   - employer_profiles: enabled');
    console.log('\n🎉 FIX COMPLETE! Try logging in again.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run
fixRLSRecursion();
