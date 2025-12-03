const { Client } = require('pg');
const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const serverDir = resolve(__dirname, '..');
process.chdir(serverDir);

require('dotenv').config({ path: join(serverDir, '.env') });

async function runMigration() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: 5432,
    user: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD || '',
    database: process.env.POSTGRES_DB,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const schema = process.env.POSTGRES_SCHEMA || 'public';
    await client.query(`SET search_path TO ${schema}`);
    console.log(`Using schema: ${schema}`);

    const tablesCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = $1 
      AND table_name IN ('user', 'clan', 'user_guard')
      ORDER BY table_name
    `, [schema]);
    
    console.log('Found tables:', tablesCheck.rows.map(r => r.table_name).join(', '));
    
    if (tablesCheck.rows.length === 0) {
      throw new Error(`No tables found in schema "${schema}". Please check your schema name.`);
    }

    const migrationPath = join(
        serverDir,
        'migrations',
        'add_user_and_clan_guards_stats.sql',
    );
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('Running migration...');
    await client.query(migrationSQL);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();