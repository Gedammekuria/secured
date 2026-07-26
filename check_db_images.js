import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const { rows: projects } = await pool.query('SELECT id, title, image FROM projects;');
  console.log("PROJECTS:");
  projects.forEach(p => console.log(p.id, p.title, p.image));

  const { rows: services } = await pool.query('SELECT id, category, cards FROM services;');
  console.log("\nSERVICES:");
  services.forEach(s => {
    console.log(s.id, s.category);
    const cards = typeof s.cards === 'string' ? JSON.parse(s.cards) : s.cards;
    cards.forEach(c => console.log('  ', c.title, c.image));
  });

  pool.end();
}

run().catch(err => {
  console.error("Error:", err);
  pool.end();
});
