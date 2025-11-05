#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔐 Creating test user login...\n');

// Login with test employer
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'test-employer@example.com',
  password: 'testPassword123'
});

if (error) {
  console.log('❌ Login error:', error.message);
  
  // Try creating the user first
  console.log('📝 Creating test user...');
  const { data: signupData, error: signupError } = await supabase.auth.signUp({
    email: 'test-employer@example.com',
    password: 'testPassword123',
    options: {
      data: {
        role: 'employer',
        fullName: 'Test Employer'
      }
    }
  });
  
  if (signupError) {
    console.log('❌ Signup error:', signupError.message);
  } else {
    console.log('✅ User created successfully');
  }
} else {
  console.log('✅ Login successful');
  console.log('Session:', data.session ? 'EXISTS' : 'NONE');
  console.log('User:', data.user?.email);
}