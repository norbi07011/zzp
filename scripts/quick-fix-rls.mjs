// QUICK FIX: Disable RLS temporarily
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // ⚠️ SECRET!

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLS() {
  console.log('🔧 Fixing RLS policies...');
  
  try {
    // Wyłącz RLS na czas debugowania
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
        ALTER TABLE employer_profiles DISABLE ROW LEVEL SECURITY;
      `
    });
    
    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ RLS disabled - możesz się zalogować!');
      console.log('⚠️ PAMIĘTAJ: Włącz RLS po naprawie!');
    }
  } catch (err) {
    console.error('❌ Failed:', err);
  }
}

fixRLS();
