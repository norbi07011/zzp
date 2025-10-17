// ============================================
// AUTOMATED QUICK TEST SCRIPT
// ============================================
// This script checks if all critical endpoints work
// Run in browser console: Copy & Paste this entire file
// ============================================

(async function quickTest() {
  console.clear();
  console.log('🚀 Starting Quick Test of All 18 Modules...\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1';
  const SUPABASE_KEY = localStorage.getItem('supabase.auth.token') 
    ? JSON.parse(localStorage.getItem('supabase.auth.token')).access_token 
    : 'YOUR_ANON_KEY_HERE';

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test endpoints
  const endpoints = [
    { name: 'Test Slots', url: `${SUPABASE_URL}/test_slots?select=*&limit=1`, critical: true },
    { name: 'Payments', url: `${SUPABASE_URL}/payments?select=*&limit=1`, critical: true },
    { name: 'Notifications', url: `${SUPABASE_URL}/notifications?select=*&limit=1`, critical: true },
    { name: 'Reports', url: `${SUPABASE_URL}/reports?select=*&limit=1`, critical: true },
    { name: 'Appointments', url: `${SUPABASE_URL}/appointments?select=*&limit=1`, critical: false },
    { name: 'Companies', url: `${SUPABASE_URL}/companies?select=*&limit=1`, critical: false },
    { name: 'Media', url: `${SUPABASE_URL}/media?select=*&limit=1`, critical: false },
    { name: 'Blog Posts', url: `${SUPABASE_URL}/blog_posts?select=*&limit=1`, critical: false },
    { name: 'Blog Categories', url: `${SUPABASE_URL}/blog_categories?select=*`, critical: false },
    { name: 'Email Campaigns', url: `${SUPABASE_URL}/email_campaigns?select=*&limit=1`, critical: false },
    { name: 'Email Templates', url: `${SUPABASE_URL}/email_templates?select=*&limit=1`, critical: false },
    { name: 'Meta Tags', url: `${SUPABASE_URL}/meta_tags?select=*&limit=1`, critical: false },
    { name: 'Redirects', url: `${SUPABASE_URL}/redirects?select=*&limit=1`, critical: false },
    { name: 'System Settings', url: `${SUPABASE_URL}/system_settings?select=*`, critical: false },
    { name: 'Notification Templates', url: `${SUPABASE_URL}/notification_templates?select=*&limit=1`, critical: false },
    { name: 'Report Templates', url: `${SUPABASE_URL}/report_templates?select=*&limit=1`, critical: false },
    { name: 'Security Alerts', url: `${SUPABASE_URL}/security_alerts?select=*&limit=1`, critical: false },
    { name: 'Activity Logs', url: `${SUPABASE_URL}/activity_logs?select=*&limit=1`, critical: false },
    { name: 'API Keys', url: `${SUPABASE_URL}/api_keys?select=*&limit=1`, critical: false },
    { name: 'Blog Authors', url: `${SUPABASE_URL}/blog_authors?select=*&limit=1`, critical: false },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint.url, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        }
      });

      const status = response.status;
      const statusText = response.statusText;
      
      if (status === 200 || status === 201) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : 0;
        
        console.log(`✅ ${endpoint.name}: ${status} ${statusText} (${count} records)`);
        results.passed++;
        results.tests.push({ name: endpoint.name, status: 'PASS', code: status, count });
      } else if (status === 404) {
        console.error(`❌ ${endpoint.name}: ${status} NOT FOUND - Table doesn't exist!`);
        results.failed++;
        results.tests.push({ name: endpoint.name, status: 'FAIL', code: status, error: 'Table not found' });
      } else {
        console.warn(`⚠️  ${endpoint.name}: ${status} ${statusText}`);
        results.failed++;
        results.tests.push({ name: endpoint.name, status: 'WARNING', code: status });
      }
    } catch (error) {
      console.error(`❌ ${endpoint.name}: ERROR - ${error.message}`);
      results.failed++;
      results.tests.push({ name: endpoint.name, status: 'ERROR', error: error.message });
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 QUICK TEST RESULTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Passed: ${results.passed}/${endpoints.length}`);
  console.log(`❌ Failed: ${results.failed}/${endpoints.length}`);
  console.log(`📈 Success Rate: ${Math.round((results.passed / endpoints.length) * 100)}%\n`);

  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! SQL Migration successful!');
    console.log('✅ All 20 tables are accessible');
    console.log('✅ No 404 errors');
    console.log('✅ Ready for production!\n');
  } else {
    console.log('⚠️  SOME TESTS FAILED - Review errors above');
    console.log('💡 Check SQL_VERIFICATION.sql in Supabase');
    console.log('💡 Verify all tables were created\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  return results;
})();
