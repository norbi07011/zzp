#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  console.log('🔍 Weryfikacja bazy danych...\n');

  const tables = [
    'profiles',
    'workers',
    'employers',
    'certificates',
    'jobs',
    'applications',
    'reviews',
    'zzp_exam_applications'
  ];

  let allGood = true;

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: BŁĄD - ${error.message}`);
        allGood = false;
      } else {
        console.log(`✅ ${table}: OK (${count || 0} rekordów)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: BŁĄD - ${err.message}`);
      allGood = false;
    }
  }

  console.log('\n' + '='.repeat(50));

  if (allGood) {
    console.log('✅ Wszystkie tabele są dostępne i działają!');
    console.log('\n📝 Następne kroki:');
    console.log('1. Dodaj SUPABASE_SERVICE_ROLE_KEY do .env');
    console.log('2. Uruchom: node create-test-admin.mjs');
    console.log('3. Uruchom: npm run dev');
    console.log('4. Otwórz: http://localhost:5173/login');
  } else {
    console.log('❌ Niektóre tabele mają problemy!');
    console.log('Sprawdź logi powyżej.');
  }
  console.log('='.repeat(50) + '\n');
}

verifyDatabase();
