#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5MTk5NzIsImV4cCI6MjA0NjQ5NTk3Mn0.Bl3xqVjZEGBbhU55uUk7vRXNg3f4BmVg_3Q8PQBhK0k';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 COMPREHENSIVE DATABASE DIAGNOSIS\n');
console.log('=' .repeat(80));

// Function to run SQL query
async function runQuery(name, sql) {
  console.log(`\n📊 ${name}`);
  console.log('-'.repeat(80));
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try alternative method
      const { data: altData, error: altError } = await supabase
        .from('_sql_exec')
        .select('*')
        .limit(0);
      
      if (altError) {
        console.log('⚠️  Cannot execute - need service role key');
        return null;
      }
    }
    
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
    
    return data;
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return null;
  }
}

// SECTION 1: Tables without RLS
const rlsQuery = `
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
ORDER BY tablename;
`;

// SECTION 2: Existing RLS policies
const policiesQuery = `
SELECT
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
`;

// Since we can't execute raw SQL with anon key, let's check via information_schema
console.log('\n🔍 Checking available tables...\n');

const { data: tables, error: tablesError } = await supabase
  .from('information_schema.tables')
  .select('table_name')
  .eq('table_schema', 'public');

if (tablesError) {
  console.log('⚠️  Limited access with anon key. Trying alternative approach...\n');
  
  // Alternative: Check which tables we can access
  const tablesToCheck = [
    'profiles', 'workers', 'employers', 'jobs', 'job_applications',
    'messages', 'notifications', 'projects', 'project_members', 
    'project_invites', 'project_tasks', 'project_chat_groups',
    'project_chat_messages', 'communication_files', 'saved_jobs',
    'certificates', 'team_activity_logs'
  ];
  
  console.log('📋 Testing table access (RLS enforcement):\n');
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ ${table.padEnd(30)} - TABLE DOES NOT EXIST`);
        } else if (error.message.includes('permission denied') || error.message.includes('RLS')) {
          console.log(`🔒 ${table.padEnd(30)} - RLS ENABLED (access denied for anon)`);
        } else {
          console.log(`⚠️  ${table.padEnd(30)} - ${error.message}`);
        }
      } else {
        console.log(`✅ ${table.padEnd(30)} - ACCESSIBLE (may have RLS or no RLS)`);
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(30)} - ${err.message}`);
    }
  }
} else {
  console.log(`Found ${tables?.length || 0} tables`);
  console.log(tables?.map(t => t.table_name).join(', '));
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 NOTE: Full diagnosis requires service_role key');
console.log('   Current scan uses anon key (limited permissions)\n');
console.log('📝 Recommendations:');
console.log('   1. Tables accessible to anon → need RLS policies');
console.log('   2. Tables with permission denied → likely have RLS');
console.log('   3. Non-existent tables → need to be created\n');

console.log('='.repeat(80));
