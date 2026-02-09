#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(url, key);

async function runMigrations() {
  const migrationsDir = path.join(__dirname, '../db/migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

  console.log(`Applying ${files.length} migration(s)...`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`---> Applying ${file}`);
    try {
      await supabase.rpc('exec', { sql });
      console.log(`✓ ${file} applied`);
    } catch (err) {
      // Supabase doesn't have exec RPC by default, so try direct query
      try {
        await supabase.from('_dummy').select().limit(0);
        // If we got here, connection works but we need SQL execution
        // For now, print instructions for manual application
        console.warn(`⚠ Migration ${file} requires manual application in Supabase SQL Editor`);
      } catch (connErr) {
        console.error(`✗ Connection failed: ${connErr.message}`);
        process.exit(1);
      }
    }
  }
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
