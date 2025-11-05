#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('📋 Checking existing profiles...\n');

const { data: profiles, error } = await supabase.from('profiles').select('*');

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log('👥 Available profiles:');
  profiles.forEach(profile => {
    console.log(`- ${profile.email} (${profile.role}) - ID: ${profile.id}`);
  });
  
  console.log('\n🔑 To manually login in browser:');
  console.log('1. Go to /login page');
  console.log('2. Try with these emails and common passwords like:');
  console.log('   - testPassword123');
  console.log('   - password123');
  console.log('   - 123456');
  console.log('   - test123');
}