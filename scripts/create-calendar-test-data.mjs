#!/usr/bin/env node

// ============================================
// SCRIPT: Tworzenie danych testowych dla kalendarza
// Purpose: Utworzenie przykładowych eventów i spotkań
// ============================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, serviceKey);

async function createCalendarTestData() {
  console.log('📅 Tworzę dane testowe dla systemu kalendarza...\n');
  
  try {
    // 1. Pobierz istniejący projekt i użytkowników
    const { data: projects } = await supabase
      .from('communication_projects')
      .select('id, name')
      .limit(1);
    
    if (!projects || projects.length === 0) {
      console.log('❌ Brak projektów - uruchom najpierw create-test-data.mjs');
      return;
    }
    
    const project = projects[0];
    console.log(`🏗️ Projekt: ${project.name}`);
    
    // 2. Pobierz członków projektu
    const { data: members } = await supabase
      .from('project_members')
      .select('user_id, role')
      .eq('project_id', project.id);
    
    if (!members || members.length === 0) {
      console.log('❌ Brak członków projektu');
      return;
    }
    
    // Pobierz dane użytkowników osobno
    const userIds = members.map(m => m.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, role')
      .in('id', userIds);
    
    // Połącz dane
    const membersWithProfiles = members.map(member => {
      const profile = profiles?.find(p => p.id === member.user_id);
      return {
        ...member,
        email: profile?.email || 'unknown@example.com'
      };
    });
    
    console.log(`👥 Członkowie projektu: ${membersWithProfiles.length}`);
    membersWithProfiles.forEach(m => {
      console.log(`   - ${m.email} [${m.role}]`);
    });
    
    const supervisor = membersWithProfiles.find(m => m.role === 'supervisor');
    const worker = membersWithProfiles.find(m => m.role === 'worker');
    const accountant = membersWithProfiles.find(m => m.role === 'accountant');
    
    // 3. Pobierz zadania do linkowania
    const { data: tasks } = await supabase
      .from('project_tasks')
      .select('id, title')
      .eq('project_id', project.id)
      .limit(3);
    
    console.log(`📝 Dostępne zadania: ${tasks?.length || 0}`);
    
    // 4. Utwórz różnorodne eventy
    console.log('\n📅 Tworzę eventy testowe...');
    
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const testEvents = [
      {
        project_id: project.id,
        title: 'Weekly Team Standup',
        description: 'Cotygodniowe spotkanie zespołu - przegląd postępów i planowanie na kolejny tydzień.',
        event_type: 'meeting',
        status: 'confirmed',
        start_date: new Date(tomorrow.setHours(9, 0)).toISOString(),
        end_date: new Date(tomorrow.setHours(10, 0)).toISOString(),
        location: 'Sala konferencyjna - Building Site Office',
        location_type: 'physical',
        organized_by: supervisor?.user_id || members[0].user_id,
        created_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        requires_confirmation: true,
        agenda: '1. Postęp zadań z poprzedniego tygodnia\n2. Nowe zadania i priorytet\n3. Problemy i blokery\n4. Planowanie na kolejny tydzień',
        tags: ['weekly', 'standup', 'team', 'planning']
      },
      {
        project_id: project.id,
        title: 'Safety Inspection Deadline',
        description: 'Termin wykonania obowiązkowej kontroli bezpieczeństwa na placu budowy zgodnie z przepisami holenderskimi.',
        event_type: 'deadline',
        status: 'planned',
        start_date: new Date(nextWeek.setHours(17, 0)).toISOString(),
        all_day: true,
        organized_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        created_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        related_task_id: tasks?.[0]?.id,
        tags: ['safety', 'deadline', 'compliance', 'inspection'],
        reminder_minutes: [60, 1440, 4320] // 1h, 1 day, 3 days
      },
      {
        project_id: project.id,
        title: 'Material Delivery - Concrete',
        description: 'Dostawa betonu dla fundamentów. Koordynacja z dostawcą i przygotowanie miejsca rozładunku.',
        event_type: 'delivery',
        status: 'confirmed',
        start_date: new Date(new Date().setDate(now.getDate() + 3)).setHours(7, 30),
        end_date: new Date(new Date().setDate(now.getDate() + 3)).setHours(11, 0),
        location: 'Building Site - Main Entrance, Damrak 123, Amsterdam',
        location_type: 'physical',
        organized_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        created_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        related_task_id: tasks?.[1]?.id,
        tags: ['delivery', 'concrete', 'materials', 'coordination'],
        custom_fields: {
          supplier: 'BetonMix Amsterdam BV',
          contact_phone: '+31 20 123 4567',
          delivery_amount: '15m³ C25/30',
          truck_count: 3
        }
      },
      {
        project_id: project.id,
        title: 'Client Progress Review',
        description: 'Miesięczne spotkanie z klientem - prezentacja postępów, omówienie planów na kolejny miesiąc.',
        event_type: 'client_meeting',
        status: 'planned',
        start_date: new Date(nextMonth.setHours(14, 0)).toISOString(),
        end_date: new Date(nextMonth.setHours(16, 0)).toISOString(),
        location: 'Client Office - Herengracht 123, Amsterdam',
        location_type: 'physical',
        organized_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        created_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        requires_confirmation: true,
        agenda: '1. Prezentacja wykonanych prac\n2. Przegląd harmonogramu\n3. Budżet i koszty\n4. Planowane prace na kolejny miesiąc\n5. Q&A',
        tags: ['client', 'review', 'monthly', 'progress']
      },
      {
        project_id: project.id,
        title: 'VCA Safety Training',
        description: 'Obowiązkowe szkolenie VCA (Veiligheid, Gezondheid en Milieu Checklist Aannemers) dla wszystkich pracowników.',
        event_type: 'training',
        status: 'confirmed',
        start_date: new Date(new Date().setDate(now.getDate() + 5)).setHours(8, 0),
        end_date: new Date(new Date().setDate(now.getDate() + 5)).setHours(17, 0),
        location: 'Training Center Amsterdam',
        location_type: 'physical',
        organized_by: accountant?.user_id || supervisor?.user_id || membersWithProfiles[0].user_id,
        created_by: accountant?.user_id || supervisor?.user_id || membersWithProfiles[0].user_id,
        requires_confirmation: true,
        tags: ['training', 'safety', 'vca', 'certification', 'mandatory'],
        custom_fields: {
          trainer: 'Safety Training Solutions BV',
          certification: 'VCA Basis + VCA VOL',
          cost_per_person: 'EUR 125',
          language: 'Dutch'
        }
      },
      {
        project_id: project.id,
        title: 'Foundation Milestone Complete',
        description: 'Zakończenie etapu fundamentów - kamień milowy projektu. Przegląd jakości i przygotowanie do kolejnego etapu.',
        event_type: 'milestone',
        status: 'planned',
        start_date: new Date(new Date().setDate(now.getDate() + 14)).setHours(16, 0),
        all_day: false,
        organized_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        created_by: supervisor?.user_id || membersWithProfiles[0].user_id,
        related_task_id: tasks?.[1]?.id,
        tags: ['milestone', 'foundation', 'completion', 'quality'],
        custom_fields: {
          milestone_percentage: 25,
          next_phase: 'Structural works',
          quality_check_required: true
        }
      }
    ];
    
    // Konwertuj daty do string dla wszystkich eventów
    const eventsToInsert = testEvents.map(event => ({
      ...event,
      start_date: typeof event.start_date === 'number' ? new Date(event.start_date).toISOString() : event.start_date,
      end_date: event.end_date ? (typeof event.end_date === 'number' ? new Date(event.end_date).toISOString() : event.end_date) : null
    }));
    
    const { data: createdEvents, error: eventsError } = await supabase
      .from('project_events')
      .insert(eventsToInsert)
      .select();
    
    if (eventsError) {
      console.log(`❌ Błąd tworzenia eventów: ${eventsError.message}`);
      return;
    }
    
    console.log(`✅ Utworzono ${createdEvents?.length} eventów:`);
    createdEvents?.forEach(event => {
      console.log(`   - ${event.title} [${event.event_type}/${event.status}] - ${new Date(event.start_date).toLocaleDateString()}`);
    });
    
    // 5. Dodaj uczestników do eventów
    console.log('\n👥 Dodaję uczestników do eventów...');
    
    const participants = [];
    for (const event of createdEvents || []) {
      // Dodaj organizatora jako uczestnika
      participants.push({
        event_id: event.id,
        user_id: event.organized_by,
        attendance_status: 'accepted',
        role: 'organizer'
      });
      
      // Dodaj innych członków zespołu w zależności od typu eventu
      for (const member of membersWithProfiles) {
        if (member.user_id !== event.organized_by) {
          let shouldAdd = false;
          let role = 'participant';
          let status = 'invited';
          
          switch (event.event_type) {
            case 'meeting':
            case 'milestone':
              shouldAdd = true; // wszyscy na spotkania
              status = Math.random() > 0.3 ? 'accepted' : 'tentative';
              break;
            case 'training':
              shouldAdd = member.role === 'worker'; // tylko pracownicy na szkolenia
              status = 'accepted';
              break;
            case 'client_meeting':
              shouldAdd = member.role !== 'worker'; // nie pracownicy na spotkania z klientem
              status = 'accepted';
              break;
            case 'delivery':
              shouldAdd = member.role === 'worker'; // pracownicy na dostawy
              status = 'accepted';
              break;
          }
          
          if (shouldAdd) {
            participants.push({
              event_id: event.id,
              user_id: member.user_id,
              attendance_status: status,
              role: role
            });
          }
        }
      }
    }
    
    if (participants.length > 0) {
      const { data: createdParticipants, error: participantsError } = await supabase
        .from('event_participants')
        .insert(participants)
        .select();
      
      if (participantsError) {
        console.log(`❌ Błąd dodawania uczestników: ${participantsError.message}`);
      } else {
        console.log(`✅ Dodano ${createdParticipants?.length} uczestników do eventów`);
      }
    }
    
    // 6. Podsumowanie
    console.log('\n🎯 PODSUMOWANIE KALENDARZA:');
    console.log(`✅ Projekt: ${project.name}`);
    console.log(`✅ Eventy: ${createdEvents?.length || 0}`);
    console.log(`✅ Uczestnicy: ${participants.length}`);
    console.log(`✅ Powiązane zadania: ${tasks?.length || 0}`);
    
    console.log('\n📅 TYPY EVENTÓW:');
    const eventTypeCounts = {};
    createdEvents?.forEach(e => {
      eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1;
    });
    Object.entries(eventTypeCounts).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });
    
    console.log('\n🚀 SYSTEM KALENDARZA GOTOWY DO UŻYCIA!');
    
  } catch (e) {
    console.error('💥 Błąd tworzenia danych kalendarza:', e.message);
  }
}

// Uruchom tworzenie danych testowych
createCalendarTestData();