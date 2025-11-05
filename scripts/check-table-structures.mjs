import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkTableStructures() {
  console.log('🔍 SPRAWDZANIE STRUKTUR TABEL\n');

  try {
    // Sprawdz strukturę tabeli employers
    console.log('📋 TABELA EMPLOYERS:');
    console.log('==================');
    const { data: employersData, error: empError } = await supabase
      .from('employers')
      .select('*')
      .limit(1);

    if (empError) {
      console.error('❌ Błąd employers:', empError.message);
    } else if (employersData && employersData.length > 0) {
      const columns = Object.keys(employersData[0]);
      console.log('Kolumny employers:', columns.join(', '));
      console.log('Przykładowy rekord:', JSON.stringify(employersData[0], null, 2));
    }

    console.log('\n📋 TABELA ACCOUNTANTS:');
    console.log('===================');
    const { data: accountantsData, error: accError } = await supabase
      .from('accountants')
      .select('*')
      .limit(1);

    if (accError) {
      console.error('❌ Błąd accountants:', accError.message);
    } else if (accountantsData && accountantsData.length > 0) {
      const columns = Object.keys(accountantsData[0]);
      console.log('Kolumny accountants:', columns.join(', '));
      console.log('Przykładowy rekord:', JSON.stringify(accountantsData[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Błąd ogólny:', error.message);
  }
}

checkTableStructures();