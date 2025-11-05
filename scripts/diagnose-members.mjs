#!/usr/bin/env node

// ============================================
// SCRIPT: Diagnoza project_members
// Purpose: Sprawdzenie dlaczego brak członków
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function diagnoseMembersIssue() {
  console.log('🔍 Diagnoza problemu z project_members...\n');
  
  try {
    // 1. Sprawdź projekty
    console.log('🏗️ PROJEKTY:');
    const { data: projects } = await supabase
      .from('communication_projects')
      .select('*');
    
    console.log(`Znalezione projekty: ${projects?.length || 0}`);
    projects?.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });
    
    if (!projects || projects.length === 0) {
      console.log('❌ Brak projektów!');
      return;
    }
    
    const firstProject = projects[0];
    
    // 2. Sprawdź project_members
    console.log('\n👥 PROJECT_MEMBERS:');
    const { data: allMembers, error: membersError } = await supabase
      .from('project_members')
      .select('*');
    
    if (membersError) {
      console.log(`❌ Błąd pobierania members: ${membersError.message}`);
      return;
    }
    
    console.log(`Wszyscy członkowie: ${allMembers?.length || 0}`);
    allMembers?.forEach(m => {
      console.log(`   - Project: ${m.project_id} | User: ${m.user_id} | Role: ${m.role}`);
    });
    
    // 3. Sprawdź members dla konkretnego projektu
    const { data: projectMembers } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', firstProject.id);
    
    console.log(`\nCzłonkowie projektu ${firstProject.name}: ${projectMembers?.length || 0}`);
    projectMembers?.forEach(m => {
      console.log(`   - User: ${m.user_id} | Role: ${m.role}`);
    });
    
    // 4. Sprawdź profiles
    console.log('\n👤 PROFILES:');
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, role');
    
    console.log(`Profile użytkowników: ${profiles?.length || 0}`);
    profiles?.forEach(p => {
      console.log(`   - ${p.email} (ID: ${p.id}) [${p.role}]`);
    });
    
    // 5. Jeśli brak członków - dodaj ich
    if (!projectMembers || projectMembers.length === 0) {
      console.log('\n🔧 NAPRAWIAM - dodaję członków projektu...');
      
      if (profiles && profiles.length > 0) {
        const membersToAdd = profiles.slice(0, 3).map((profile, index) => {
          const roles = ['supervisor', 'worker', 'accountant'];
          return {
            project_id: firstProject.id,
            user_id: profile.id,
            role: roles[index] || 'worker'
          };
        });
        
        const { data: addedMembers, error: addError } = await supabase
          .from('project_members')
          .insert(membersToAdd)
          .select();
        
        if (addError) {
          console.log(`❌ Błąd dodawania członków: ${addError.message}`);
        } else {
          console.log(`✅ Dodano ${addedMembers?.length} członków:`);
          addedMembers?.forEach(m => {
            console.log(`   - User: ${m.user_id} | Role: ${m.role}`);
          });
        }
      }
    }
    
  } catch (e) {
    console.error('💥 Błąd diagnozy:', e.message);
  }
}

// Uruchom diagnozę
diagnoseMembersIssue();