#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🔍 CHECKING TABLE STRUCTURES FOR RLS MIGRATION\n');
console.log('=' .repeat(80));

async function checkTableColumns(tableName) {
  console.log(`\n📋 Table: ${tableName}`);
  console.log('-'.repeat(80));
  
  try {
    // Get one row to see column structure
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      return null;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`✅ Columns (${columns.length}):`);
      columns.forEach(col => console.log(`   - ${col}`));
      return columns;
    } else {
      console.log(`⚠️  Table exists but is EMPTY - cannot determine columns`);
      console.log(`   Need to check schema directly in Supabase Dashboard`);
      return [];
    }
    
  } catch (err) {
    console.log(`❌ Error: ${err.message}`);
    return null;
  }
}

// Check all 7 critical tables
const tablesToCheck = [
  'profiles',
  'workers', 
  'employers',
  'accountants',
  'jobs',
  'messages',
  'notifications'
];

(async () => {
  const results = {};
  
  for (const table of tablesToCheck) {
    results[table] = await checkTableColumns(table);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 SUMMARY:\n');
  
  for (const [table, columns] of Object.entries(results)) {
    if (columns === null) {
      console.log(`❌ ${table.padEnd(20)} - ERROR (table might not exist)`);
    } else if (columns.length === 0) {
      console.log(`⚠️  ${table.padEnd(20)} - EMPTY (check schema manually)`);
    } else {
      console.log(`✅ ${table.padEnd(20)} - ${columns.length} columns found`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Structure check complete\n');
})();
