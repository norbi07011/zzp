#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🔍 Debugging auth and data...\n');

// 1. Check current auth session
const { data: session } = await supabase.auth.getSession();
console.log('Auth session:', session.session ? 'EXISTS' : 'NONE');

// 2. Check profiles data  
const { data: profiles, error: profilesError } = await supabase.from('profiles').select('*');
console.log('Profiles:', profilesError ? profilesError.message : `${profiles.length} records`);
if (profiles && profiles.length > 0) {
  console.log('First profile:', profiles[0]);
}

// 3. Check employers data
const { data: employers, error: employersError } = await supabase.from('employers').select('*');
console.log('Employers:', employersError ? employersError.message : `${employers.length} records`);
if (employers && employers.length > 0) {
  console.log('First employer:', employers[0]);
}

// 4. Check workers data  
const { data: workers, error: workersError } = await supabase.from('workers').select('*');
console.log('Workers:', workersError ? workersError.message : `${workers.length} records`);
if (workers && workers.length > 0) {
  console.log('First worker:', workers[0]);
}