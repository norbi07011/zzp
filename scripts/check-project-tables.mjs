import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const projectTables = [
  'projects',
  'project_members', 
  'project_tasks',
  'project_chat_groups',
  'project_invites',
  'project_chat_messages'
];

console.log('\n🔍 SPRAWDZAM STRUKTURĘ TABEL PROJEKTOWYCH...\n');
console.log('=' .repeat(80));

for (const tableName of projectTables) {
  console.log(`\n📋 TABLE: ${tableName}`);
  console.log('-'.repeat(80));
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      continue;
    }
    
    if (!data || data.length === 0) {
      console.log(`⚠️  Table exists but is EMPTY (no rows to inspect)`);
      console.log(`   Need to check CREATE TABLE statement in migration files`);
      continue;
    }
    
    const columns = Object.keys(data[0]);
    console.log(`✅ Columns (${columns.length} total):`);
    columns.forEach(col => {
      const value = data[0][col];
      const type = typeof value === 'object' && value !== null ? 'object/json' : typeof value;
      console.log(`   - ${col} (${type})`);
    });
    
  } catch (err) {
    console.log(`❌ Unexpected error: ${err.message}`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n✅ VERIFICATION COMPLETE\n');
