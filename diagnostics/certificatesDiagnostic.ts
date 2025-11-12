/**
 * 🧪 DIAGNOSTIC TEST - Certyfikaty & ZZP Exams
 * Data: 12 listopada 2025
 * 
 * ZGODNIE Z COPILOT INSTRUCTIONS:
 * - CP1: Sprawdzić czy admin ma dostęp (RLS test)
 * - Porównać COUNT(*) vs SELECT * - różnica = RLS problem
 * - Debug przez console.log('💸 DEBUG: ...')
 */

import { supabase } from '../src/lib/supabase';

interface DiagnosticResult {
  table: string;
  count_query: number | null;
  select_query: number | null;
  rls_blocked: boolean;
  error?: string;
}

/**
 * 🔍 TEST 1: Sprawdź dostęp admina do tabel certyfikatów
 */
export async function testAdminAccess(): Promise<DiagnosticResult[]> {
  console.log('💸 DEBUG: Starting admin access diagnostic...');
  
  const results: DiagnosticResult[] = [];
  const tables = [
    'certificates',
    'zzp_exam_applications', 
    'test_appointments',
    'payments'
  ];

  for (const table of tables) {
    console.log(`💸 DEBUG: Testing table: ${table}`);
    
    try {
      // TEST A: COUNT(*) - zwykle działa nawet z RLS
      const { count: countResult, error: countError } = await (supabase as any)
        .from(table)
        .select('*', { count: 'exact', head: true });

      console.log(`💸 DEBUG: ${table} COUNT = ${countResult}`, countError);

      // TEST B: SELECT * - może być zablokowany przez RLS
      const { data: selectResult, error: selectError } = await (supabase as any)
        .from(table)
        .select('*')
        .limit(100);

      console.log(`💸 DEBUG: ${table} SELECT = ${selectResult?.length || 0} rows`, selectError);

      // Porównanie: różnica = RLS problem!
      const rlsBlocked = (countResult || 0) > 0 && (selectResult?.length || 0) === 0;

      results.push({
        table,
        count_query: countResult,
        select_query: selectResult?.length || 0,
        rls_blocked: rlsBlocked,
        error: countError?.message || selectError?.message
      });

      if (rlsBlocked) {
        console.error(`🚨 RLS PROBLEM: ${table} - COUNT=${countResult} but SELECT=0`);
      } else {
        console.log(`✅ ${table} - OK (COUNT=${countResult}, SELECT=${selectResult?.length})`);
      }

    } catch (error: any) {
      console.error(`❌ ${table} ERROR:`, error);
      results.push({
        table,
        count_query: null,
        select_query: null,
        rls_blocked: true,
        error: error.message
      });
    }
  }

  return results;
}

/**
 * 🔍 TEST 2: Sprawdź strukturę tabeli zzp_exam_applications
 */
export async function testZZPExamStructure() {
  console.log('💸 DEBUG: Testing zzp_exam_applications structure...');

  try {
    // Pobierz jedną aplikację, żeby zobaczyć strukturę
    const { data, error } = await (supabase as any)
      .from('zzp_exam_applications')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignoruj "no rows" error
      console.error('❌ Structure test error:', error);
      return null;
    }

    if (data) {
      console.log('✅ zzp_exam_applications kolumny:', Object.keys(data));
      console.log('💸 DEBUG: Sample data:', data);
      
      // Sprawdź czy documents jest JSONB
      if (data.documents) {
        console.log('✅ documents (JSONB):', data.documents);
      }
    } else {
      console.log('⚠️ Brak danych w zzp_exam_applications (tabela pusta)');
    }

    return data;
  } catch (error) {
    console.error('❌ Structure test failed:', error);
    return null;
  }
}

/**
 * 🔍 TEST 3: Sprawdź statystyki certyfikatów (dla AdminDashboard)
 */
export async function testCertificateStats() {
  console.log('💸 DEBUG: Testing certificate stats...');

  try {
    const [
      { count: totalCerts, error: certsError },
      { count: pendingCerts, error: pendingError },
      { count: verifiedCerts, error: verifiedError },
      { count: totalApps, error: appsError },
      { count: approvedApps, error: approvedError }
    ] = await Promise.all([
      // Total certificates
      supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true }),
      
      // Pending certificates (not verified)
      supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false),
      
      // Verified certificates
      supabase
        .from('certificates')
        .select('*', { count: 'exact', head: true })
        .eq('verified', true),
      
      // Total ZZP applications
      (supabase as any)
        .from('zzp_exam_applications')
        .select('*', { count: 'exact', head: true }),
      
      // Approved applications
      (supabase as any)
        .from('zzp_exam_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
    ]);

    const stats = {
      totalCertificates: totalCerts || 0,
      pendingCertificates: pendingCerts || 0,
      verifiedCertificates: verifiedCerts || 0,
      totalApplications: totalApps || 0,
      approvedApplications: approvedApps || 0
    };

    console.log('✅ Certificate stats:', stats);

    // Sprawdź błędy
    if (certsError) console.error('❌ Certificates error:', certsError);
    if (pendingError) console.error('❌ Pending certs error:', pendingError);
    if (verifiedError) console.error('❌ Verified certs error:', verifiedError);
    if (appsError) console.error('❌ Applications error:', appsError);
    if (approvedError) console.error('❌ Approved apps error:', approvedError);

    return stats;
  } catch (error) {
    console.error('❌ Stats test failed:', error);
    return null;
  }
}

/**
 * 🔍 TEST 4: Sprawdź routing paths dla kart certyfikatów
 */
export function testRoutingPaths() {
  console.log('💸 DEBUG: Testing routing paths...');

  const cards = [
    {
      name: 'Certyfikaty Premium ZZP',
      currentPath: '/admin/certificate-approval',
      expectedPath: '/admin/zzp-exams',
      status: 'NEEDS_FIX'
    },
    {
      name: 'Zarządzanie Certyfikatami',
      currentPath: '/admin/certificates',
      expectedPath: '/admin/certificates',
      status: 'OK (path), NEEDS_STATS_FIX'
    },
    {
      name: 'Harmonogram Testów',
      currentPath: '/admin/test-scheduler',
      expectedPath: '/admin/scheduler',
      status: 'NEEDS_FIX'
    }
  ];

  console.table(cards);

  return cards;
}

/**
 * 🎯 RUN ALL TESTS
 */
export async function runAllDiagnostics() {
  console.log('🧪 ========================================');
  console.log('🧪 DIAGNOSTIC TEST - CERTYFIKATY & ZZP');
  console.log('🧪 ========================================');

  // Test 1: Admin access & RLS
  console.log('\n📋 TEST 1: Admin Access & RLS');
  const accessResults = await testAdminAccess();
  console.table(accessResults);

  // Test 2: Structure
  console.log('\n📋 TEST 2: ZZP Exam Structure');
  await testZZPExamStructure();

  // Test 3: Stats
  console.log('\n📋 TEST 3: Certificate Stats');
  const stats = await testCertificateStats();

  // Test 4: Routing
  console.log('\n📋 TEST 4: Routing Paths');
  testRoutingPaths();

  console.log('\n✅ All diagnostics completed!');
  console.log('📊 Check console.log output above for details');

  return {
    accessResults,
    stats
  };
}

// Export dla użycia w konsoli
if (typeof window !== 'undefined') {
  (window as any).runCertificateDiagnostics = runAllDiagnostics;
  console.log('💡 TIP: Run window.runCertificateDiagnostics() in browser console');
}
