import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const { rows } = await pool.query("SELECT id, title FROM projects WHERE title ILIKE '%maryod%';");
  console.log("Found:", rows);

  if (rows.length === 0) {
    console.log("No Maryod Bakery project found.");
    pool.end();
    return;
  }

  for (const r of rows) {
    await pool.query("DELETE FROM projects WHERE id = $1", [r.id]);
    console.log(`Deleted project ID ${r.id}: "${r.title}"`);
  }

  console.log("Done!");
  pool.end();
}

run().catch(err => { console.error(err); pool.end(); });
