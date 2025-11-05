#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('📊 CHECKING ACCOUNTANT DATA');
console.log('===========================\n');

async function checkAccountantData() {
  // Get latest accountant
  const { data: accountants, error } = await supabase
    .from('accountants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (!accountants || accountants.length === 0) {
    console.log('⚠️ No accountant records found!');
    return;
  }

  const accountant = accountants[0];
  console.log('✅ Latest Accountant Record:');
  console.log('─────────────────────────────');
  console.log(`ID: ${accountant.id}`);
  console.log(`Profile ID: ${accountant.profile_id}`);
  console.log(`Full Name: ${accountant.full_name}`);
  console.log(`Company: ${accountant.company_name || 'N/A'}`);
  console.log(`Email: ${accountant.email}`);
  console.log(`Phone: ${accountant.phone || 'N/A'}`);
  console.log(`City: ${accountant.city || 'N/A'}`);
  console.log(`KVK: ${accountant.kvk_number || 'N/A'}`);
  console.log(`BTW: ${accountant.btw_number || 'N/A'}`);
  console.log(`License: ${accountant.license_number || 'N/A'}`);
  console.log(`Experience: ${accountant.years_experience} years`);
  console.log(`Rating: ${accountant.rating} (${accountant.rating_count} reviews)`);
  console.log(`Total Clients: ${accountant.total_clients}`);
  console.log(`Specializations: ${JSON.stringify(accountant.specializations)}`);
  console.log(`Languages: ${JSON.stringify(accountant.languages)}`);
  console.log(`Bio: ${accountant.bio || 'N/A'}`);
  console.log(`Active: ${accountant.is_active}`);
  console.log(`Verified: ${accountant.is_verified}`);
  console.log(`Created: ${accountant.created_at}`);
}

checkAccountantData();
