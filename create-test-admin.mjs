#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestAdmin() {
  console.log('🔧 Creating test admin account...\n');

  const testAdmin = {
    email: 'admin@zzpwerkplaats.nl',
    password: 'Admin123!@#',
    fullName: 'Admin Test',
    role: 'admin'
  };

  try {
    // 1. Create user in auth
    console.log('1️⃣ Creating user in auth.users...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testAdmin.email,
      password: testAdmin.password,
      email_confirm: true,
      user_metadata: {
        fullName: testAdmin.fullName,
        role: testAdmin.role
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists, checking profile...');

        // Get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === testAdmin.email);
        if (!existingUser) throw new Error('User exists but cannot be found');

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .single();

        if (profileError || !profile) {
          console.log('2️⃣ Creating missing profile...');
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: testAdmin.email,
              full_name: testAdmin.fullName,
              role: testAdmin.role
            });

          if (insertError) throw insertError;
          console.log('✅ Profile created successfully!');
        } else {
          console.log('✅ Profile already exists!');
        }

        console.log('\n✅ Admin account ready!');
        console.log('\n📧 Email:', testAdmin.email);
        console.log('🔑 Password:', testAdmin.password);
        return;
      }
      throw authError;
    }

    console.log('✅ User created:', authData.user.id);

    // 2. Profile should be created automatically by trigger
    console.log('2️⃣ Checking profile (created by trigger)...');

    // Wait a moment for trigger to execute
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      console.log('⚠️  Trigger did not create profile, creating manually...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: testAdmin.email,
          full_name: testAdmin.fullName,
          role: testAdmin.role
        });

      if (insertError) throw insertError;
      console.log('✅ Profile created manually!');
    } else {
      console.log('✅ Profile exists:', profile.role);
    }

    console.log('\n✅ Test admin account created successfully!\n');
    console.log('📧 Email:', testAdmin.email);
    console.log('🔑 Password:', testAdmin.password);
    console.log('\n🎯 You can now login at: http://localhost:5173/login');

  } catch (error) {
    console.error('\n❌ Error creating test admin:', error.message);
    process.exit(1);
  }
}

// Run
createTestAdmin();
