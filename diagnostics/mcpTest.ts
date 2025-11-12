/**
 * 🧪 MCP TEST RUNNER - Direct Supabase Query
 * Data: 12 listopada 2025
 * 
 * TESTY ZGODNE Z COPILOT INSTRUCTIONS:
 * - COUNT(*) vs SELECT * - różnica = RLS problem
 * - Sprawdzenie dostępu admina do wszystkich tabel
 */

import { supabase } from '../src/lib/supabase';

interface TableTestResult {
  table: string;
  count_result: number | null;
  select_result: number | null;
  rls_blocked: boolean;
  error: string | null;
}

async function testTableAccess(tableName: string): Promise<TableTestResult> {
  console.log(`💸 DEBUG: Testing table: ${tableName}`);
  
  try {
    // TEST 1: COUNT(*) - zwykle działa nawet z RLS
    const { count, error: countError } = await (supabase as any)
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    console.log(`💸 DEBUG: ${tableName} COUNT = ${count}`, countError?.message);

    // TEST 2: SELECT * - może być zablokowany przez RLS
    const { data, error: selectError } = await (supabase as any)
      .from(tableName)
      .select('*')
      .limit(100);

    console.log(`💸 DEBUG: ${tableName} SELECT = ${data?.length || 0} rows`, selectError?.message);

    // Analiza RLS
    const countVal = count || 0;
    const selectVal = data?.length || 0;
    const rlsBlocked = countVal > 0 && selectVal === 0;

    if (rlsBlocked) {
      console.error(`🚨 RLS PROBLEM: ${tableName} - COUNT=${countVal} but SELECT=0`);
    } else if (countVal === selectVal) {
      console.log(`✅ ${tableName} - OK (COUNT=${countVal}, SELECT=${selectVal})`);
    } else {
      console.warn(`⚠️ ${tableName} - Different (COUNT=${countVal}, SELECT=${selectVal})`);
    }

    return {
      table: tableName,
      count_result: countVal,
      select_result: selectVal,
      rls_blocked: rlsBlocked,
      error: countError?.message || selectError?.message || null
    };

  } catch (error: any) {
    console.error(`❌ ${tableName} ERROR:`, error.message);
    return {
      table: tableName,
      count_result: null,
      select_result: null,
      rls_blocked: true,
      error: error.message
    };
  }
}

async function runMCPTests() {
  console.log('🧪 ========================================');
  console.log('🧪 MCP DIAGNOSTIC TEST - SUPABASE');
  console.log('🧪 ========================================');
  console.log('');

  const tables = [
    'certificates',
    'zzp_exam_applications',
    'test_appointments',
    'payments',
    'workers',
    'employers',
    'profiles'
  ];

  const results: TableTestResult[] = [];

  for (const table of tables) {
    const result = await testTableAccess(table);
    results.push(result);
  }

  console.log('');
  console.log('📊 SUMMARY TABLE:');
  console.table(results);

  // Sprawdź czy są problemy RLS
  const rlsProblems = results.filter(r => r.rls_blocked);
  if (rlsProblems.length > 0) {
    console.log('');
    console.error('🚨 RLS PROBLEMS DETECTED:');
    rlsProblems.forEach(p => {
      console.error(`   - ${p.table}: COUNT=${p.count_result} but SELECT=0`);
    });
    console.log('');
    console.log('💡 FIX: Sprawdź polityki RLS w Supabase Dashboard');
    console.log('   Admin powinien mieć pełny dostęp do wszystkich tabel!');
  } else {
    console.log('');
    console.log('✅ Wszystkie tabele dostępne - brak problemów RLS');
  }

  return results;
}

// Export dla window
if (typeof window !== 'undefined') {
  (window as any).runMCPTests = runMCPTests;
  console.log('💡 TIP: Run window.runMCPTests() in browser console');
}

export { runMCPTests, testTableAccess };
