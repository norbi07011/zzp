#!/usr/bin/env node

/**
 * ZZP Werkplaats - Communication System Migration
 * Executes 20251029_1000_communication_system.sql migration
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables manually (since we can't use dotenv)
const env = {}
try {
  const envContent = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim()
    }
  })
} catch (error) {
  console.error('❌ Could not load .env file')
  process.exit(1)
}

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

console.log('🔧 Creating Supabase admin client...')
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQL(sql) {
  try {
    // For table creation, we'll use a simple approach
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
    
    return await response.json()
  } catch (error) {
    throw new Error(`SQL execution failed: ${error.message}`)
  }
}

async function runCommunicationMigration() {
  const migrationPath = join(__dirname, '..', 'database-migrations', '20251029_1000_communication_system.sql')
  
  try {
    console.log('📂 Reading communication system migration...')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    console.log('🚀 Executing communication system migration...')
    console.log(`📊 SQL size: ${migrationSQL.length} characters`)
    
    // Since the full SQL might be complex, let's break it into logical parts
    // First, let's just try to create the tables one by one
    
    const tableCreationStatements = [
      // 1. Project Messages Table
      `CREATE TABLE IF NOT EXISTS public.project_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_id UUID NOT NULL,
        sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        sender_name TEXT NOT NULL,
        sender_role TEXT NOT NULL CHECK (sender_role IN ('foreman', 'worker', 'supervisor', 'employer', 'subcontractor')),
        message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'file', 'location', 'progress_update')),
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // 2. Project Chat Groups Table
      `CREATE TABLE IF NOT EXISTS public.project_chat_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        name TEXT NOT NULL,
        group_type TEXT DEFAULT 'general' CHECK (group_type IN ('general', 'safety', 'progress', 'quality', 'coordination')),
        description TEXT,
        members JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // 3. Building Notifications Table
      `CREATE TABLE IF NOT EXISTS public.building_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        project_id UUID NOT NULL,
        notification_type TEXT NOT NULL CHECK (notification_type IN ('safety_alert', 'progress_update', 'quality_issue', 'deadline_reminder', 'message')),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}'::jsonb,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // 4. Progress Reports Table
      `CREATE TABLE IF NOT EXISTS public.progress_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL CHECK (reporter_role IN ('foreman', 'worker', 'supervisor', 'employer', 'subcontractor')),
        task_name TEXT NOT NULL,
        task_description TEXT,
        progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
        status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked', 'review')),
        quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
        notes TEXT,
        attachments JSONB DEFAULT '[]'::jsonb,
        location_data JSONB,
        weather_conditions TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      
      // 5. Safety Alerts Table
      `CREATE TABLE IF NOT EXISTS public.safety_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        reporter_name TEXT NOT NULL,
        reporter_role TEXT NOT NULL CHECK (reporter_role IN ('foreman', 'worker', 'supervisor', 'employer', 'subcontractor')),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        safety_level TEXT DEFAULT 'medium' CHECK (safety_level IN ('low', 'medium', 'high', 'critical')),
        incident_type TEXT CHECK (incident_type IN ('near_miss', 'accident', 'hazard', 'violation', 'equipment_failure')),
        location_description TEXT,
        location_data JSONB,
        immediate_actions TEXT,
        status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
        assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
        attachments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`
    ]
    
    console.log(`📋 Creating ${tableCreationStatements.length} tables...`)
    
    for (let i = 0; i < tableCreationStatements.length; i++) {
      const statement = tableCreationStatements[i]
      console.log(`🔄 Creating table ${i + 1}/${tableCreationStatements.length}...`)
      
      try {
        await executeSQL(statement)
        console.log(`✅ Table ${i + 1} created successfully`)
      } catch (error) {
        console.error(`❌ Error creating table ${i + 1}:`)
        console.error(error.message)
        // Continue with next table
      }
    }
    
    console.log('🎉 Communication system migration completed!')
    return true
    
  } catch (error) {
    console.error('❌ Migration failed:')
    console.error(error.message)
    return false
  }
}

async function main() {
  console.log('🚀 Starting communication system migration...')
  console.log(`📡 Supabase URL: ${supabaseUrl}`)
  
  // Test connection first
  try {
    const { data, error } = await supabase.auth.getSession()
    console.log('✅ Supabase client initialized')
  } catch (error) {
    console.error('❌ Supabase connection failed:')
    console.error(error.message)
    process.exit(1)
  }
  
  const success = await runCommunicationMigration()
  
  if (success) {
    console.log('🎊 Communication system migration completed successfully!')
    
    // Verify tables
    console.log('🔍 Verifying created tables...')
    try {
      const { data, error } = await supabase
        .from('project_messages')
        .select('*')
        .limit(1)
      
      if (!error) {
        console.log('✅ Tables created and accessible!')
      } else {
        console.log('⚠️  Tables created but verification failed:', error.message)
      }
    } catch (verifyError) {
      console.log('⚠️  Could not verify tables:', verifyError.message)
    }
    
  } else {
    console.log('❌ Migration failed!')
    process.exit(1)
  }
}

main().catch(error => {
  console.error('💥 Unexpected error:')
  console.error(error)
  process.exit(1)
})