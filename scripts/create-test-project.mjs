#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CURRENT_USER_ID = '8a17942f-7209-469a-bafc-1a748d195eef'; // Z błędów w konsoli

console.log('📝 Creating test project for current user...\n');

try {
  const testProject = {
    title: 'Test Team Project - Den Haag',
    description: 'Testowy projekt zespołowy dla demonstracji funkcji zarządzania zespołem.',
    project_address: 'Bramsstraat 11, 2534DL Den Haag',
    owner_id: CURRENT_USER_ID,
    status: 'active',
    start_date: '2025-10-29',
    deadline: '2025-12-31',
    budget_total: 150000,
    budget_used: 25000,
    client_name: 'Test Client BV',
    client_contact: 'client@example.com'
  };

  const { data, error } = await supabase
    .from('projects')
    .insert(testProject)
    .select()
    .single();

  if (error) {
    console.log('❌ Error creating project:', error.message);
  } else {
    console.log('✅ Test project created successfully!');
    console.log('Project ID:', data.id);
    console.log('Title:', data.title);
    console.log('Owner:', data.owner_id);
  }

  // Also create a test notification
  const testNotification = {
    user_id: CURRENT_USER_ID,
    project_id: data?.id,
    type: 'info',
    title: 'Witamy w systemie zespołowym!',
    message: 'Twój testowy projekt został utworzony. Możesz teraz zarządzać zespołem.',
    created_at: new Date().toISOString()
  };

  const { error: notifError } = await supabase
    .from('project_notifications')
    .insert(testNotification);

  if (notifError) {
    console.log('⚠️ Notification error:', notifError.message);
  } else {
    console.log('✅ Test notification created');
  }

} catch (e) {
  console.log('💥 Script error:', e.message);
}