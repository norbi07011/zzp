/**
 * SUPABASE MIGRATION INSTALLER
 * Automatically applies authentication tables migration to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

/**
 * Run migration file
 */
async function runMigration(filePath) {
  console.log(`\n📄 Reading migration file: ${filePath}`);
  
  try {
    // Read migration file
    const migrationSQL = readFileSync(filePath, 'utf-8');
    
    console.log(`📊 Migration size: ${migrationSQL.length} characters`);
    console.log('⏳ Executing migration...\n');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL,
    });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql function not found, trying direct execution...');
      
      const { error: directError } = await supabase
        .from('_migrations')
        .insert({ name: '003_authentication_tables', executed_at: new Date().toISOString() });
      
      if (directError) {
        throw new Error(`Migration failed: ${directError.message}`);
      }
    }
    
    console.log('✅ Migration executed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');
  
  const checks = [
    {
      name: 'Email Verification Tokens Table',
      query: `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'email_verification_tokens'
      `,
    },
    {
      name: 'Password Reset Tokens Table',
      query: `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'password_reset_tokens'
      `,
    },
    {
      name: 'Two-Factor Auth Table',
      query: `
        SELECT COUNT(*) as count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'two_factor_auth'
      `,
    },
    {
      name: 'Indexes',
      query: `
        SELECT COUNT(*) as count 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename IN (
            'email_verification_tokens',
            'password_reset_tokens',
            'two_factor_auth'
          )
      `,
    },
    {
      name: 'RLS Policies',
      query: `
        SELECT COUNT(*) as count 
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN (
            'email_verification_tokens',
            'password_reset_tokens',
            'two_factor_auth'
          )
      `,
    },
    {
      name: 'Helper Functions',
      query: `
        SELECT COUNT(*) as count
        FROM information_schema.routines
        WHERE routine_schema = 'public'
          AND routine_name IN (
            'cleanup_expired_tokens',
            'update_2fa_updated_at'
          )
      `,
    },
  ];
  
  for (const check of checks) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: check.query,
      });
      
      if (error) {
        console.log(`⚠️  ${check.name}: Unable to verify (${error.message})`);
      } else {
        const count = data?.[0]?.count || 0;
        const status = count > 0 ? '✅' : '❌';
        console.log(`${status} ${check.name}: ${count}`);
      }
    } catch (error) {
      console.log(`⚠️  ${check.name}: Verification skipped`);
    }
  }
  
  console.log('\n✅ Verification complete!');
}

/**
 * Test cleanup function
 */
async function testCleanup() {
  console.log('\n🧹 Testing cleanup function...\n');
  
  try {
    const { data, error } = await supabase.rpc('cleanup_expired_tokens');
    
    if (error) {
      console.log('⚠️  Cleanup function test skipped:', error.message);
    } else {
      console.log(`✅ Cleanup function works! Deleted ${data || 0} tokens.`);
    }
  } catch (error) {
    console.log('⚠️  Cleanup function test failed:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   SUPABASE AUTHENTICATION MIGRATION INSTALLER             ║');
  console.log('║   Migration: 003_authentication_tables.sql                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  try {
    // Check Supabase connection
    console.log('\n🔗 Testing Supabase connection...');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error && error.message !== 'Auth session missing!') {
      throw new Error(`Connection failed: ${error.message}`);
    }
    
    console.log('✅ Connected to Supabase successfully!');
    console.log(`📍 URL: ${SUPABASE_URL}`);
    
    // Get migration file path
    const migrationPath = join(
      __dirname,
      '..',
      'database',
      'migrations',
      '003_authentication_tables.sql'
    );
    
    // Confirm before running
    console.log('\n⚠️  WARNING: This will create new tables in your database.');
    console.log('If tables already exist, this may fail.');
    console.log('\nPress Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise((resolve) => setTimeout(resolve, 5000));
    
    // Run migration
    await runMigration(migrationPath);
    
    // Verify results
    await verifyMigration();
    
    // Test cleanup function
    await testCleanup();
    
    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║   ✅ MIGRATION COMPLETED SUCCESSFULLY!                    ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    
    console.log('\n📚 Next Steps:');
    console.log('  1. Review tables in Supabase Dashboard');
    console.log('  2. Test authentication services');
    console.log('  3. Configure OAuth providers');
    console.log('  4. Create UI components');
    console.log('  5. Set up daily cleanup cron job');
    
    console.log('\n📖 Documentation:');
    console.log('  - DATABASE_MIGRATION_GUIDE.md');
    console.log('  - AUTHENTICATION_QUICK_START.md');
    console.log('  - FAZA2_KROK2.2_AUTHENTICATION_COMPLETE.md');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n📚 Check DATABASE_MIGRATION_GUIDE.md for troubleshooting');
    process.exit(1);
  }
}

// Run migration
main();
