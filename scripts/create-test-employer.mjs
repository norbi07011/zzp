/**
 * =====================================================
 * CREATE TEST EMPLOYER
 * =====================================================
 * Creates test employer profile for employer@zzpwerkplaats.nl
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🏢 CREATING TEST EMPLOYER');
console.log('='.repeat(80));

async function createTestEmployer() {
  try {
    // Step 1: Find employer user
    console.log('\n📋 Step 1: Finding employer user...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'employer@zzpwerkplaats.nl')
      .single();

    if (profileError || !profile) {
      console.error('❌ Employer user not found!');
      console.error('   Please create user: employer@zzpwerkplaats.nl first');
      process.exit(1);
    }

    console.log('✅ Found employer user:');
    console.log(`   ID: ${profile.id}`);
    console.log(`   Email: ${profile.email}`);
    console.log(`   Name: ${profile.full_name}`);
    console.log(`   Role: ${profile.role}`);

    // Step 2: Check if employer profile exists
    console.log('\n📋 Step 2: Checking employer profile...');
    const { data: existingEmployer, error: checkError } = await supabase
      .from('employers')
      .select('*')
      .eq('user_id', profile.id)
      .single();

    if (existingEmployer) {
      console.log('⚠️  Employer profile already exists:');
      console.log(`   ID: ${existingEmployer.id}`);
      console.log(`   Company: ${existingEmployer.company_name}`);
      console.log('\n✅ No action needed!');
      return;
    }

    // Step 3: Create employer profile
    console.log('\n📋 Step 3: Creating employer profile...');
    const { data: newEmployer, error: insertError } = await supabase
      .from('employers')
      .insert({
        user_id: profile.id,
        company_name: 'Test Bouwbedrijf B.V.',
        kvk_number: '12345678',
        contact_person: profile.full_name || 'Test Contact',
        phone: '+31612345678',
        email: profile.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create employer profile:');
      console.error(`   ${insertError.message}`);
      process.exit(1);
    }

    console.log('✅ Employer profile created:');
    console.log(`   ID: ${newEmployer.id}`);
    console.log(`   Company: ${newEmployer.company_name}`);
    console.log(`   KVK: ${newEmployer.kvk_number}`);
    console.log(`   Contact: ${newEmployer.contact_person}`);

    // Step 4: Create test subscription
    console.log('\n📋 Step 4: Creating test subscription...');
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        employer_id: newEmployer.id,
        plan: 'premium',
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        amount: 49.99,
        currency: 'EUR',
        auto_renew: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (subError) {
      console.log('⚠️  Could not create subscription:');
      console.log(`   ${subError.message}`);
    } else {
      console.log('✅ Subscription created:');
      console.log(`   Plan: ${subscription.plan}`);
      console.log(`   Status: ${subscription.status}`);
      console.log(`   Expires: ${new Date(subscription.end_date).toLocaleDateString()}`);
    }

    // Step 5: Add some test search history
    console.log('\n📋 Step 5: Adding test search history...');
    const searchHistoryData = [
      {
        employer_id: newEmployer.id,
        category: 'construction',
        level: 'senior',
        location: 'Amsterdam',
        results_count: 5,
        search_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        employer_id: newEmployer.id,
        category: 'electrician',
        level: 'intermediate',
        location: 'Rotterdam',
        results_count: 3,
        search_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const { data: searches, error: searchError } = await supabase
      .from('search_history')
      .insert(searchHistoryData)
      .select();

    if (searchError) {
      console.log('⚠️  Could not create search history:');
      console.log(`   ${searchError.message}`);
    } else {
      console.log(`✅ Created ${searches.length} search history entries`);
    }

    // Step 6: Add test notification
    console.log('\n📋 Step 6: Adding test notification...');
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: profile.id,
        type: 'info',
        title: 'Witamy w ZZP Werkplaats!',
        message: 'Twoje konto pracodawcy zostało pomyślnie utworzone. Możesz teraz zacząć szukać pracowników.',
        read: false,
        link: '/employer/search',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (notifError) {
      console.log('⚠️  Could not create notification:');
      console.log(`   ${notifError.message}`);
    } else {
      console.log('✅ Test notification created');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 TEST EMPLOYER SETUP COMPLETE!');
    console.log('='.repeat(80));
    console.log('\n📊 Summary:');
    console.log(`   ✅ User: ${profile.email}`);
    console.log(`   ✅ Employer profile: ${newEmployer.company_name}`);
    console.log(`   ✅ Subscription: ${subscription?.plan || 'none'}`);
    console.log(`   ✅ Search history: ${searches?.length || 0} entries`);
    console.log(`   ✅ Notifications: 1`);
    console.log('\n🚀 Ready to test EmployerDashboard!\n');

  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error);
    process.exit(1);
  }
}

createTestEmployer();
