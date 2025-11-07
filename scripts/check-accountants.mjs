import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('📊 ACCOUNTANTS TABLE:\n');

const { data, error, count } = await supabase
  .from('accountants')
  .select('*', { count: 'exact' });

if (error) {
  console.log('❌ Error:', error.message);
} else {
  console.log(`✅ Count: ${count}`);
  console.log('\nRecords:');
  console.log(JSON.stringify(data, null, 2));
}
