import pkg from 'pg';
const { Client } = pkg;
import * as dotenv from 'dotenv';

dotenv.config();

// Supabase connection string pattern
const connectionString = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.dtnotuyagygexmkyqtgb.supabase.co:5432/postgres`;

async function createProjectFilesTable() {
  console.log('🚀 Tworzę tabelę project_files przez bezpośrednie połączenie...\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Połączono z bazą danych');

    // Stwórz tabelę project_files
    console.log('📋 Tworzę tabelę project_files...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_files (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          project_id uuid NOT NULL,
          uploaded_by uuid NOT NULL,
          file_name character varying NOT NULL,
          original_name character varying NOT NULL,
          file_size bigint NOT NULL,
          file_type character varying NULL,
          mime_type character varying NULL,
          storage_path text NOT NULL,
          description text NULL,
          is_public boolean DEFAULT false,
          created_at timestamp with time zone DEFAULT now(),
          updated_at timestamp with time zone DEFAULT now(),
          deleted_at timestamp with time zone NULL
      );
    `);
    console.log('✅ Tabela project_files utworzona');

    // Dodaj indeksy
    console.log('📋 Tworzę indeksy...');
    await client.query(`CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_project_files_created_at ON project_files(created_at);`);
    console.log('✅ Indeksy utworzone');

    // Funkcja update_updated_at_column
    console.log('📋 Tworzę funkcję update_updated_at_column...');
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = now();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    console.log('✅ Funkcja utworzona');

    // Trigger
    console.log('📋 Tworzę trigger...');
    await client.query(`DROP TRIGGER IF EXISTS update_project_files_updated_at ON project_files;`);
    await client.query(`
      CREATE TRIGGER update_project_files_updated_at
          BEFORE UPDATE ON project_files
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log('✅ Trigger utworzony');

    // RLS
    console.log('📋 Włączam Row Level Security...');
    await client.query(`ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;`);
    console.log('✅ RLS włączone');

    // Test czy tabela działa
    console.log('\n🔍 Testuję dostęp do tabeli...');
    const result = await client.query('SELECT COUNT(*) FROM project_files;');
    console.log('✅ Tabela project_files działa! Rekordów:', result.rows[0].count);

  } catch (error) {
    console.error('❌ Błąd:', error.message);
  } finally {
    await client.end();
    console.log('🔌 Rozłączono z bazą danych');
  }
}

createProjectFilesTable();