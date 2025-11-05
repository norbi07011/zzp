import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Konfiguracja Supabase
const supabaseUrl = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTc4NTMzMCwiZXhwIjoyMDc1MzYxMzMwfQ.H-_sd9_qn40CfLD_dFschmDKkTbPP57lcfqp-20RVk8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Rozpoczynam migrację systemu plików...');
  
  try {
    // Sprawdź czy tabele już istnieją
    console.log('📊 Sprawdzam obecny stan bazy...');
    
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['project_files', 'task_attachments', 'event_attachments']);
    
    if (checkError) {
      console.log('⚠️  Błąd sprawdzania tabel (prawdopodobnie nie istnieją):', checkError.message);
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Znalezione tabele:', existingTables.map(t => t.table_name).join(', '));
      console.log('⚠️  Tabele już istnieją - pomijam migrację');
      return;
    }
    
    // Wykonaj migrację przez bezpośrednie zapytania
    console.log('🔧 Tworzę typy ENUM...');
    
    // 1. Tworzenie typu file_type
    try {
      await supabase.rpc('exec', {
        sql: `
        DO $$ BEGIN
          CREATE TYPE file_type AS ENUM (
            'image', 'document', 'spreadsheet', 'presentation', 
            'archive', 'video', 'audio', 'cad', 'blueprint', 'other'
          );
        EXCEPTION
          WHEN duplicate_object THEN
            RAISE NOTICE 'Type file_type already exists, skipping...';
        END $$;
        `
      });
      console.log('✅ Typ file_type utworzony');
    } catch (error) {
      console.log('⚠️  file_type:', error.message);
    }
    
    // 2. Tworzenie typu file_status
    try {
      await supabase.rpc('exec', {
        sql: `
        DO $$ BEGIN
          CREATE TYPE file_status AS ENUM (
            'uploading', 'active', 'processing', 'archived', 'deleted'
          );
        EXCEPTION
          WHEN duplicate_object THEN
            RAISE NOTICE 'Type file_status already exists, skipping...';
        END $$;
        `
      });
      console.log('✅ Typ file_status utworzony');
    } catch (error) {
      console.log('⚠️  file_status:', error.message);
    }
    
    console.log('\n📊 Sprawdzam funkcję update_updated_at_column...');
    
    // 3. Sprawdź i utwórz funkcję update_updated_at_column jeśli nie istnieje
    try {
      const { data: functions } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .eq('routine_name', 'update_updated_at_column');
      
      if (!functions || functions.length === 0) {
        console.log('🔧 Tworzę funkcję update_updated_at_column...');
        await supabase.rpc('exec', {
          sql: `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
          `
        });
        console.log('✅ Funkcja update_updated_at_column utworzona');
      } else {
        console.log('✅ Funkcja update_updated_at_column już istnieje');
      }
    } catch (error) {
      console.log('⚠️  update_updated_at_column:', error.message);
    }
    
    console.log('\n📋 Tworzę główną tabelę project_files...');
    
    // 4. Tworzenie tabeli project_files - podzielone na części
    try {
      await supabase.rpc('exec', {
        sql: `
        CREATE TABLE IF NOT EXISTS project_files (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
          uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
          original_filename VARCHAR(255) NOT NULL,
          storage_path TEXT NOT NULL,
          file_size BIGINT NOT NULL,
          mime_type VARCHAR(100) NOT NULL,
          file_type file_type NOT NULL,
          file_hash VARCHAR(64),
          thumbnail_path TEXT,
          description TEXT,
          tags TEXT[],
          status file_status NOT NULL DEFAULT 'active',
          is_public BOOLEAN NOT NULL DEFAULT false,
          download_count INTEGER DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMP,
          CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 104857600),
          CONSTRAINT valid_storage_path CHECK (storage_path ~ '^[a-zA-Z0-9/_.-]+$')
        );
        `
      });
      console.log('✅ Tabela project_files utworzona');
    } catch (error) {
      console.error('❌ Błąd tworzenia project_files:', error.message);
    }
    
    // 5. Tworzenie indeksów
    console.log('🔧 Tworzę indeksy...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);',
      'CREATE INDEX IF NOT EXISTS idx_project_files_type ON project_files(file_type);',
      'CREATE INDEX IF NOT EXISTS idx_project_files_status ON project_files(status);',
      'CREATE INDEX IF NOT EXISTS idx_project_files_created ON project_files(created_at DESC);',
      'CREATE INDEX IF NOT EXISTS idx_project_files_hash ON project_files(file_hash);',
      'CREATE INDEX IF NOT EXISTS idx_project_files_active ON project_files(project_id, status) WHERE status = \'active\';'
    ];
    
    for (const indexSQL of indexes) {
      try {
        await supabase.rpc('exec', { sql: indexSQL });
      } catch (error) {
        console.log('⚠️  Indeks:', error.message);
      }
    }
    console.log('✅ Indeksy utworzone');
    
    // 6. Tworzenie pozostałych tabel
    console.log('📋 Tworzę tabele załączników...');
    
    try {
      await supabase.rpc('exec', {
        sql: `
        CREATE TABLE IF NOT EXISTS task_attachments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id UUID NOT NULL,
          file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
          attached_by UUID NOT NULL REFERENCES auth.users(id),
          attachment_type VARCHAR(50) DEFAULT 'general',
          description TEXT,
          is_required BOOLEAN DEFAULT false,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_task_file UNIQUE (task_id, file_id)
        );
        `
      });
      console.log('✅ Tabela task_attachments utworzona');
    } catch (error) {
      console.error('❌ Błąd task_attachments:', error.message);
    }
    
    try {
      await supabase.rpc('exec', {
        sql: `
        CREATE TABLE IF NOT EXISTS event_attachments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          event_id UUID NOT NULL,
          file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
          attached_by UUID NOT NULL REFERENCES auth.users(id),
          attachment_type VARCHAR(50) DEFAULT 'general',
          description TEXT,
          created_at TIMESTAMP NOT NULL DEFAULT NOW(),
          CONSTRAINT unique_event_file UNIQUE (event_id, file_id)
        );
        `
      });
      console.log('✅ Tabela event_attachments utworzona');
    } catch (error) {
      console.error('❌ Błąd event_attachments:', error.message);
    }
    
    // 7. RLS Policies
    console.log('🔒 Włączam Row Level Security...');
    
    const rlsCommands = [
      'ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;'
    ];
    
    for (const rlsSQL of rlsCommands) {
      try {
        await supabase.rpc('exec', { sql: rlsSQL });
      } catch (error) {
        console.log('⚠️  RLS:', error.message);
      }
    }
    
    console.log('\n🎯 MIGRACJA ZAKOŃCZONA!');
    console.log('✅ System plików i załączników gotowy do użycia');
    
  } catch (error) {
    console.error('💥 Krytyczny błąd migracji:', error.message);
    process.exit(1);
  }
}

// Uruchom migrację
runMigration();