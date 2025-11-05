#!/usr/bin/env node
/**
 * Schema Check Script
 * Pobiera aktualną strukturę bazy danych z Supabase i zapisuje do .tmp/schema.json
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase connection
const SUPABASE_URL = 'https://dtnotuyagygexmkyqtgb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0bm90dXlhZ3lnZXhta3lxdGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk5MzE3NjMsImV4cCI6MjA0NTUwNzc2M30.tIx5bC7VQqU40fSiPjVJw9Fc5Qg5nj7uKhSN5lbkyHM';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getSchema() {
  console.log('🔍 Fetching database schema from Supabase...\n');

  const schema = {
    timestamp: new Date().toISOString(),
    tables: {},
    relationships: []
  };

  try {
    // Query 1: Get all tables and columns
    const { data: columns, error: columnsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position;
      `
    });

    if (columnsError) {
      // Fallback: use direct query without RPC
      console.log('⚠️  RPC method failed, using direct metadata query...\n');
      
      const tables = [
        'profiles', 'workers', 'employers', 'jobs', 'job_applications',
        'messages', 'notifications', 'reviews', 'saved_jobs', 'worker_skills',
        'employer_followers', 'accountants', 'posts', 'post_likes', 'post_comments'
      ];

      for (const tableName of tables) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (!error && data !== null) {
            schema.tables[tableName] = {
              exists: true,
              columns: Object.keys(data[0] || {}),
              note: 'Column details from sample row'
            };
          }
        } catch (err) {
          schema.tables[tableName] = {
            exists: false,
            error: err.message
          };
        }
      }
    } else {
      // Process columns data
      columns.forEach(col => {
        if (!schema.tables[col.table_name]) {
          schema.tables[col.table_name] = { columns: [] };
        }
        schema.tables[col.table_name].columns.push({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          default: col.column_default,
          max_length: col.character_maximum_length
        });
      });
    }

    // Query 2: Get foreign keys
    const { data: fks, error: fksError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          rc.delete_rule
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        JOIN information_schema.referential_constraints AS rc
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public';
      `
    });

    if (!fksError && fks) {
      schema.relationships = fks.map(fk => ({
        from: `${fk.table_name}.${fk.column_name}`,
        to: `${fk.foreign_table_name}.${fk.foreign_column_name}`,
        on_delete: fk.delete_rule
      }));
    }

    // Save to file
    const tmpDir = path.join(path.dirname(__dirname), '.tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const outputPath = path.join(tmpDir, 'schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));

    console.log('✅ Schema saved to:', outputPath);
    console.log('\n📊 Summary:');
    console.log(`   Tables: ${Object.keys(schema.tables).length}`);
    console.log(`   Relationships: ${schema.relationships.length}`);
    console.log('\n🔗 Foreign Keys:');
    schema.relationships.forEach(rel => {
      console.log(`   ${rel.from} → ${rel.to} (ON DELETE ${rel.on_delete})`);
    });

  } catch (error) {
    console.error('❌ Error fetching schema:', error.message);
    process.exit(1);
  }
}

getSchema();
