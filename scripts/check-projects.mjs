#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

// Manually load env vars for this script
const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3ODUzMzAsImV4cCI6MjA3NTM2MTMzMH0.8gsHqR3mlGVhry2hIlxQkfFDfh5vgBrxGW_eXPXuRqw';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjects() {
  try {
    console.log('🔍 Checking communication_projects...');
    
    // Check projects table
    const { data: projects, error: projectsError } = await supabase
      .from('communication_projects')
      .select('*')
      .limit(10);
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError);
    } else {
      console.log('📊 Projects found:', projects?.length || 0);
      if (projects && projects.length > 0) {
        console.log('🎯 First project:', {
          id: projects[0].id,
          name: projects[0].name,
          created_at: projects[0].created_at
        });
      } else {
        console.log('⚠️  No projects found - creating a test project...');
        
        // Create a test project
        const { data: newProject, error: createError } = await supabase
          .from('communication_projects')
          .insert([
            {
              name: 'Demo Projekt Budowlany',
              description: 'Testowy projekt do systemu zarządzania drużynami',
              status: 'active',
              owner_id: '00000000-0000-0000-0000-000000000000' // Placeholder - będzie aktualizowane
            }
          ])
          .select()
          .single();
        
        if (createError) {
          console.error('❌ Error creating project:', createError);
        } else {
          console.log('✅ Created test project:', newProject);
        }
      }
    }
    
    // Check members
    console.log('\n🔍 Checking project_members...');
    const { data: members, error: membersError } = await supabase
      .from('project_members')
      .select('*')
      .limit(5);
    
    if (membersError) {
      console.error('❌ Error fetching members:', membersError);
    } else {
      console.log('👥 Members found:', members?.length || 0);
      if (members && members.length > 0) {
        console.log('First member:', members[0]);
      }
    }
    
    // Check users
    console.log('\n🔍 Checking auth.users...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('⚠️  No authenticated user');
    } else {
      console.log('👤 Current user:', user?.id);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkProjects();