/* eslint-disable sonarjs/cognitive-complexity, sonarjs/os-command, sonarjs/no-os-command-from-path, sonarjs/no-hardcoded-passwords, sonarjs/sql-queries, sonarjs/slow-regex */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const _supabaseUrl = 'https://bpvfkkrlyrjkwgwmfrci.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwdmZra3JseXJqa3dnd21mcmNpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM3ODcxNiwiZXhwIjoyMDc2OTU0NzE2fQ.6ySh-7ICfCqr0_ZeVUcjsUoSEsVe3tSddTBh7V7nOn8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function dumpSchema() {
  try {
    console.log('Connecting to Supabase...');

    // Get all tables information
    const { error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');

    if (tablesError) {
      console.error('Error fetching tables:', tablesError);

      // Try alternative method using RPC
      const { error: rpcError } = await supabase.rpc('exec_sql', {
        query: `
          SELECT
            table_name,
            column_name,
            data_type,
            character_maximum_length,
            is_nullable,
            column_default
          FROM information_schema.columns
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position;
        `
      });

      if (rpcError) {
        console.error('RPC error:', rpcError);

        // Final fallback: use direct SQL query through pg client
        const { Pool } = require('pg');
        const pool = new Pool({
          host: 'db.bpvfkkrlyrjkwgwmfrci.supabase.co',
          port: 5432,
          database: 'postgres',
          user: 'postgres',
          password: 'chl1197dbA!@',
          ssl: { rejectUnauthorized: false }
        });

        console.log('Using direct PostgreSQL connection...');
        const client = await pool.connect();

        try {
          // Get all tables
          const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
          `);

          let sqlDump = '-- Supabase Schema Dump\n';
          sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
          sqlDump += '-- Database: postgres\n\n';

          for (const table of tablesResult.rows) {
            const tableName = table.table_name;
            console.log(`Dumping table: ${tableName}`);

            // Get table columns
            const columnsResult = await client.query(`
              SELECT
                column_name,
                data_type,
                character_maximum_length,
                is_nullable,
                column_default
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = $1
              ORDER BY ordinal_position;
            `, [tableName]);

            // Get primary key
            const pkResult = await client.query(`
              SELECT a.attname
              FROM pg_index i
              JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
              WHERE i.indrelid = $1::regclass AND i.indisprimary;
            `, [`public.${tableName}`]);

            // Get foreign keys
            const fkResult = await client.query(`
              SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
              FROM information_schema.table_constraints AS tc
              JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
              JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
              WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND tc.table_name = $1;
            `, [tableName]);

            // Get indexes
            const indexResult = await client.query(`
              SELECT
                i.relname as index_name,
                a.attname as column_name,
                ix.indisunique as is_unique
              FROM pg_class t
              JOIN pg_index ix ON t.oid = ix.indrelid
              JOIN pg_class i ON i.oid = ix.indexrelid
              JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
              WHERE t.relkind = 'r'
                AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
                AND t.relname = $1
                AND NOT ix.indisprimary
              ORDER BY i.relname, a.attnum;
            `, [tableName]);

            // Build CREATE TABLE statement
            sqlDump += `\n-- Table: ${tableName}\n`;
            sqlDump += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;

            const columnDefs = columnsResult.rows.map(col => {
              let def = `  ${col.column_name} ${col.data_type}`;

              if (col.character_maximum_length) {
                def += `(${col.character_maximum_length})`;
              }

              if (col.column_default) {
                def += ` DEFAULT ${col.column_default}`;
              }

              if (col.is_nullable === 'NO') {
                def += ' NOT NULL';
              }

              return def;
            });

            sqlDump += columnDefs.join(',\n');

            // Add primary key
            if (pkResult.rows.length > 0) {
              const pkColumns = pkResult.rows.map(r => r.attname).join(', ');
              sqlDump += `,\n  PRIMARY KEY (${pkColumns})`;
            }

            sqlDump += '\n);\n';

            // Add foreign keys
            if (fkResult.rows.length > 0) {
              for (const fk of fkResult.rows) {
                sqlDump += `ALTER TABLE public.${tableName} ADD CONSTRAINT ${fk.constraint_name} `;
                sqlDump += `FOREIGN KEY (${fk.column_name}) `;
                sqlDump += `REFERENCES public.${fk.foreign_table_name}(${fk.foreign_column_name});\n`;
              }
            }

            // Add indexes
            if (indexResult.rows.length > 0) {
              const indexGroups = {};
              for (const idx of indexResult.rows) {
                if (!indexGroups[idx.index_name]) {
                  indexGroups[idx.index_name] = {
                    columns: [],
                    unique: idx.is_unique
                  };
                }
                indexGroups[idx.index_name].columns.push(idx.column_name);
              }

              for (const [indexName, indexInfo] of Object.entries(indexGroups)) {
                const uniqueStr = indexInfo.unique ? 'UNIQUE ' : '';
                sqlDump += `CREATE ${uniqueStr}INDEX IF NOT EXISTS ${indexName} `;
                sqlDump += `ON public.${tableName} (${indexInfo.columns.join(', ')});\n`;
              }
            }
          }

          // Save to file
          fs.writeFileSync('supabase_schema_dump.sql', sqlDump);
          console.log('\n✅ Schema dump completed: supabase_schema_dump.sql');
          console.log(`Total tables dumped: ${tablesResult.rows.length}`);

        } finally {
          client.release();
          await pool.end();
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dumpSchema();
