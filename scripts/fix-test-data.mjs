#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Supabase config - using service role for data creation
const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8'; // Service role

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTestData() {
  try {
    console.log('🔧 Fixing test data with proper UUIDs...');
    
    // Get existing projects
    const { data: projects, error: projectsError } = await supabase
      .from('communication_projects')
      .select('id, name')
      .limit(5);
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
      return;
    }
    
    if (!projects || projects.length === 0) {
      console.log('⚠️  No projects found - creating one first...');
      
      // Create a project
      const { data: newProject, error: createError } = await supabase
        .from('communication_projects')
        .insert([
          {
            name: 'Demo Projekt Budowlany',
            description: 'Testowy projekt do systemu zarządzania drużynami',
            status: 'active'
          }
        ])
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating project:', createError);
        return;
      }
      
      projects.push(newProject);
      console.log('✅ Created project:', newProject.name);
    }
    
    const projectId = projects[0].id;
    console.log(`🎯 Using project: ${projects[0].name} (${projectId})`);
    
    // Get existing users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('⚠️  No profiles found - cannot create test data');
      return;
    }
    
    const userId = profiles[0].id;
    console.log(`👤 Using user: ${profiles[0].full_name || profiles[0].email} (${userId})`);
    
    // Clear existing bad data
    console.log('🗑️  Clearing existing test data...');
    
    await supabase.from('task_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('task_attachments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('project_tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    await supabase.from('event_notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('event_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('project_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Check if user is project member
    console.log('🔍 Checking project membership...');
    const { data: membership, error: memberError } = await supabase
      .from('project_members')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .single();
    
    if (memberError || !membership) {
      console.log('➕ Adding user to project...');
      const { error: addMemberError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            user_id: userId,
            role: 'supervisor'
          }
        ]);
      
      if (addMemberError) {
        console.error('❌ Error adding member:', addMemberError);
        return;
      }
      console.log('✅ Added user to project');
    } else {
      console.log('✅ User already in project');
    }
    
    // Create test tasks with proper UUIDs
    console.log('📋 Creating test tasks...');
    const testTasks = [
      {
        project_id: projectId,
        title: 'Przygotowanie fundamentów',
        description: 'Wykopanie i przygotowanie fundamentów dla nowego budynku mieszkalnego.',
        status: 'in_progress',
        priority: 'high',
        assigned_to: userId,
        created_by: userId,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
      },
      {
        project_id: projectId,
        title: 'Montaż konstrukcji stalowej',
        description: 'Montaż głównej konstrukcji stalowej zgodnie z projektem technicznym.',
        status: 'not_started',
        priority: 'medium',
        assigned_to: userId,
        created_by: userId,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        project_id: projectId,
        title: 'Kontrola jakości betonu',
        description: 'Sprawdzenie wytrzymałości i jakości zastosowanego betonu.',
        status: 'completed',
        priority: 'urgent',
        assigned_to: userId,
        created_by: userId,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ];
    
    const { data: createdTasks, error: tasksError } = await supabase
      .from('project_tasks')
      .insert(testTasks)
      .select();
    
    if (tasksError) {
      console.error('❌ Error creating tasks:', tasksError);
      return;
    }
    
    console.log(`✅ Created ${createdTasks?.length || 0} test tasks`);
    
    // Create test events
    console.log('📅 Creating test events...');
    const testEvents = [
      {
        project_id: projectId,
        title: 'Spotkanie zespołu projektowego',
        description: 'Cotygodniowe spotkanie zespołu w celu omówienia postępów.',
        event_type: 'meeting',
        status: 'planned',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(), // 2h later
        location: 'Biuro projektowe, Amsterdam',
        organized_by: userId,
        created_by: userId
      },
      {
        project_id: projectId,
        title: 'Dostawa materiałów budowlanych',
        description: 'Planowana dostawa cementu i stali zbrojeniowej.',
        event_type: 'delivery',
        status: 'confirmed',
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
        location: 'Plac budowy, Nieuwegein',
        organized_by: userId,
        created_by: userId
      }
    ];
    
    const { data: createdEvents, error: eventsError } = await supabase
      .from('project_events')
      .insert(testEvents)
      .select();
    
    if (eventsError) {
      console.error('❌ Error creating events:', eventsError);
      return;
    }
    
    console.log(`✅ Created ${createdEvents?.length || 0} test events`);
    
    // Add event participants
    if (createdEvents && createdEvents.length > 0) {
      const participants = createdEvents.map(event => ({
        event_id: event.id,
        user_id: userId,
        attendance_status: 'accepted',
        role: 'organizer'
      }));
      
      const { error: participantsError } = await supabase
        .from('event_participants')
        .insert(participants);
      
      if (participantsError) {
        console.error('❌ Error adding participants:', participantsError);
      } else {
        console.log(`✅ Added participants to events`);
      }
    }
    
    console.log('\n🎉 Test data fixed successfully!');
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`👤 User ID: ${userId}`);
    console.log('✅ All data now uses proper UUIDs');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

fixTestData();