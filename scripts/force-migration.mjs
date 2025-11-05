import { readFileSync } from 'fs';

const projectRef = 'dtnotuyagygexmkyqtgb';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

console.log('🚀 Próbuję wykonać migrację przez Supabase Management API...\n');

async function runMigration() {
  try {
    // Czytam plik SQL
    const sqlContent = readFileSync('database-migrations/20251030_2100_create_invites_system.sql', 'utf8');
    
    console.log('📝 SQL migration załadowany');
    console.log(`📏 Długość: ${sqlContent.length} znaków\n`);
    
    // Próba 1: Przez REST API endpoint
    console.log('Próba 1: POST /rest/v1/rpc/exec...');
    
    const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log(`❌ Błąd: ${errorText}\n`);
      
      // Próba 2: Przez pgmeta API
      console.log('Próba 2: POST /pg/query...');
      
      const pgMetaUrl = `https://${projectRef}.supabase.co/pg/query`;
      
      const response2 = await fetch(pgMetaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        },
        body: JSON.stringify({
          query: sqlContent
        })
      });
      
      console.log(`Status: ${response2.status} ${response2.statusText}`);
      
      if (!response2.ok) {
        const errorText2 = await response2.text();
        console.log(`❌ Błąd: ${errorText2}\n`);
        
        console.log('❌ Nie mogę wykonać przez API.');
        console.log('\n📋 MUSISZ wykonać ręcznie przez Dashboard:');
        console.log('https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql\n');
        
        return false;
      }
    }
    
    const result = await response.json();
    console.log('✅ Odpowiedź:', result);
    
    return true;
    
  } catch (error) {
    console.error('❌ BŁĄD:', error.message);
    console.log('\n📋 MUSISZ wykonać ręcznie przez Dashboard:');
    console.log('https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql\n');
    return false;
  }
}

runMigration();
