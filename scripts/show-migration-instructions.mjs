#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

console.log('🚀 Executing: 20251031_1500_RLS_CRITICAL_TABLES.sql\n');

const sqlFile = join(__dirname, '../database-migrations/20251031_1500_RLS_CRITICAL_TABLES.sql');
const sql = readFileSync(sqlFile, 'utf-8');

// Supabase PostgreSQL REST API doesn't support raw SQL execution via client library
// We need to use the Supabase Management API or SQL Editor

console.log('📋 Migration file ready:', sqlFile);
console.log('📏 Size:', sql.length, 'characters');
console.log('\n' + '='.repeat(80));
console.log('EXECUTION INSTRUCTIONS');
console.log('='.repeat(80));
console.log('\n✅ The migration SQL is ready to execute.');
console.log('\n📝 To run this migration:');
console.log('\n1. Open Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new');
console.log('\n2. Copy the entire content of:');
console.log('   database-migrations/20251031_1500_RLS_CRITICAL_TABLES.sql');
console.log('\n3. Paste into SQL Editor and click RUN');
console.log('\n4. You should see:');
console.log('   ✅ 7 tables with RLS ENABLED');
console.log('   ✅ Policy counts (3-6 per table)');
console.log('   ✅ "MIGRATION COMPLETE" message');
console.log('\n' + '='.repeat(80));
console.log('\n💡 Alternatively, run the SQL query below to verify current state:\n');
console.log('SELECT tablename, rowsecurity FROM pg_tables');
console.log("WHERE schemaname = 'public'");
console.log("AND tablename IN ('profiles', 'workers', 'employers', 'accountants', 'jobs', 'messages', 'notifications');");
console.log('\n' + '='.repeat(80));
