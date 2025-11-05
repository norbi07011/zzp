#!/usr/bin/env node

/**
 * Instructions for running Communication System Migration
 * Usage: node scripts/run-communication-migration.mjs
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

function printMigrationInstructions() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║  🏗️ SYSTEM KOMUNIKACJI BUDOWLANEJ - Migration Instructions          ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('🎯 MIGRATION CREATES:');
  console.log('   • project_messages        - Wiadomości w projektach');
  console.log('   • project_chat_groups     - Grupy czatów (BHP, Jakość, Logistyka)');
  console.log('   • building_notifications  - Powiadomienia budowlane');
  console.log('   • progress_reports        - Raporty postępu prac');
  console.log('   • safety_alerts          - Alerty BHP i incydenty');
  console.log('   • Rozszerza messages o kontekst projektowy');
  console.log('');
  console.log('📍 KROKI DO WYKONANIA:');
  console.log('');
  console.log('1️⃣  Otwórz Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql');
  console.log('');
  console.log('2️⃣  Stwórz nowe zapytanie i wklej kod z pliku:');
  console.log('   📄 database-migrations/20251029_1000_communication_system.sql');
  console.log('');
  console.log('3️⃣  Wykonaj pełną migrację (linie 15-końiec)');
  console.log('');
  console.log('4️⃣  Sprawdź czy tabele zostały utworzone:');
  console.log('');
  console.log('   SELECT schemaname, tablename');
  console.log('   FROM pg_tables ');
  console.log('   WHERE schemaname = \'public\' ');
  console.log('     AND tablename LIKE \'%project%\' ');
  console.log('        OR tablename LIKE \'%building%\'');
  console.log('        OR tablename LIKE \'%safety%\'');
  console.log('        OR tablename LIKE \'%progress%\'');
  console.log('   ORDER BY tablename;');
  console.log('');
  console.log('5️⃣  Sprawdź RLS policies:');
  console.log('');
  console.log('   SELECT schemaname, tablename, policyname, permissive');
  console.log('   FROM pg_policies ');
  console.log('   WHERE tablename IN (');
  console.log('     \'project_messages\', \'project_chat_groups\',');
  console.log('     \'building_notifications\', \'progress_reports\', \'safety_alerts\'');
  console.log('   );');
  console.log('');
  console.log('✅ EXPECTED RESULT:');
  console.log('   • 5 nowych tabel');
  console.log('   • 15+ RLS policies');
  console.log('   • Rozszerzona tabela messages');
  console.log('   • Wszystkie indeksy dla wydajności');
  console.log('');
  console.log('⚠️  UWAGA:');
  console.log('   - Jeśli dostajesz błędy o referencjach do projects, to normalne');
  console.log('   - Tabela projects będzie utworzona później');
  console.log('   - System będzie działał bez tych referencji');
  console.log('');
  console.log('🚀 PO UDANEJ MIGRACJI:');
  console.log('   1. Uruchom: npm run db:schema');
  console.log('   2. Sprawdź .tmp/schema.json');
  console.log('   3. Przejdź do implementacji typów TypeScript');
  console.log('');
}

// Show the migration content
function showMigrationPreview() {
  console.log('📄 PREVIEW OF MIGRATION FILE:');
  console.log('═'.repeat(80));
  
  try {
    const migrationPath = join(projectRoot, 'database-migrations', '20251029_1000_communication_system.sql');
    const migrationContent = readFileSync(migrationPath, 'utf8');
    
    // Show first 20 lines
    const lines = migrationContent.split('\n');
    lines.slice(0, 25).forEach((line, index) => {
      console.log(`${(index + 1).toString().padStart(3, ' ')}: ${line}`);
    });
    
    if (lines.length > 25) {
      console.log('...');
      console.log(`    [${lines.length - 25} more lines]`);
    }
    
    console.log('═'.repeat(80));
    console.log(`📊 Total lines: ${lines.length}`);
    console.log(`📁 File: ${migrationPath}`);
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
  }
}

// Main execution
console.log('🏗️ ZZP WERKPLAATS - Communication System Migration');
console.log('═'.repeat(60));

printMigrationInstructions();
console.log('');
showMigrationPreview();

console.log('');
console.log('🔧 READY TO PROCEED?');
console.log('   Copy the SQL content to Supabase and execute!');
console.log('');