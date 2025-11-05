import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Sprawdzam strukturę tabeli profiles...\n');

// Pobierz przykładowy rekord
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1)
  .single();

if (error) {
  console.error('❌ Błąd:', error.message);
  process.exit(1);
}

if (!data) {
  console.log('⚠️  Brak danych w tabeli profiles');
  process.exit(1);
}

console.log('✅ Struktura tabeli profiles:\n');
console.log('Kolumny:', Object.keys(data).join(', '));
console.log('\nPrzykładowy rekord:');
console.log(JSON.stringify(data, null, 2));
