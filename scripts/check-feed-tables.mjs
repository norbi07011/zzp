import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkFeedTables() {
  console.log('🔍 SPRAWDZANIE TABEL FEED SYSTEM\n');
  
  const feedTables = ['posts', 'post_likes', 'post_comments', 'comment_likes', 'post_shares', 'post_views'];
  
  for (const table of feedTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(2);
      if (error) {
        console.log(`❌ TABELA '${table}': nie istnieje lub błąd - ${error.message}`);
      } else {
        console.log(`✅ TABELA '${table}': istnieje (${data.length} przykładowych rekordów)`);
        if (data.length > 0) {
          console.log('Przykład:', JSON.stringify(data[0], null, 2));
        }
      }
    } catch (err) {
      console.log(`❌ TABELA '${table}': błąd - ${err.message}`);
    }
    console.log('');
  }
}

checkFeedTables();