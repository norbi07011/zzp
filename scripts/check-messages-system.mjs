import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMessages() {
  console.log('🔍 Sprawdzam tabelę messages...\n');

  // Sprawdź czy tabela istnieje i pobierz wszystkie wiadomości
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Błąd pobierania wiadomości:', error.message);
    return;
  }

  console.log(`✅ Znaleziono ${messages?.length || 0} wiadomości\n`);

  if (messages && messages.length > 0) {
    console.log('📬 Przykładowe wiadomości:');
    messages.forEach((msg, index) => {
      console.log(`\n${index + 1}. Wiadomość ID: ${msg.id}`);
      console.log(`   Od: ${msg.sender_id}`);
      console.log(`   Do: ${msg.recipient_id}`);
      console.log(`   Temat: ${msg.subject || 'brak'}`);
      console.log(`   Przeczytana: ${msg.is_read ? 'TAK' : 'NIE'}`);
      console.log(`   Data: ${msg.created_at}`);
    });
  }

  // Sprawdź kolumny tabeli
  console.log('\n\n📋 Sprawdzam kolumny tabeli messages...');
  const { data: columns, error: colError } = await supabase
    .rpc('execute_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'messages'
        ORDER BY ordinal_position;
      `
    });

  if (colError) {
    console.log('⚠️ Nie można pobrać struktury (brak uprawnień RPC)');
  } else {
    console.log('Kolumny:', columns);
  }

  // Sprawdź triggery
  console.log('\n\n🔔 Sprawdzam czy trigger notify_new_message istnieje...');
  try {
    // Spróbuj dodać test message
    const testUserId = '00000000-0000-0000-0000-000000000001';
    console.log('Nie można przetestować triggera bez prawdziwych user_id');
  } catch (e) {
    console.log('Trigger test pominięty');
  }
}

checkMessages().catch(console.error);
