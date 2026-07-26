import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const projectMapping = {
  1: '/assets/service/amibara-project.jpg',
  4: '/assets/service/Sunrise-project.jpg',
  12: '/assets/service/fire-alarm-control-system.jpg',
  14: '/assets/service/smart-door-lock-installation.jpg',
  13: '/assets/service/fire-alarm-installation.jpg'
};

async function run() {
  console.log("Updating timestamped project images...");
  for (const [id, newPath] of Object.entries(projectMapping)) {
    await pool.query('UPDATE projects SET image = $1 WHERE id = $2', [newPath, id]);
    console.log(`Updated Project ${id} -> ${newPath}`);
  }

  console.log("Updating services cards...");
  const { rows: services } = await pool.query('SELECT id, cards FROM services;');
  for (const s of services) {
    let cardsStr = typeof s.cards === 'string' ? s.cards : JSON.stringify(s.cards);
    
    // Manual replacements for services
    const replacements = [
      ['1783799610713_fire_alarm_system.jpg', 'fire-alarm-system.jpg'],
      ['1783880951366_ring_doorbell1.jpg', 'ring-doorbell1.jpg'],
      ['1784232323035_doorlock.jpg', 'smart-doorlock.jpg'],
      ['1783880979170_glass_doorlock.jpg', 'glass-doorlock.jpg']
    ];

    let updated = false;
    for (const [oldName, newName] of replacements) {
      if (cardsStr.includes(oldName)) {
        cardsStr = cardsStr.replace(oldName, newName);
        updated = true;
      }
    }

    if (updated) {
      await pool.query('UPDATE services SET cards = $1 WHERE id = $2', [cardsStr, s.id]);
      console.log(`Updated Service ${s.id}`);
    }
  }

  console.log("Done!");
  pool.end();
}

run().catch(err => {
  console.error("Error:", err);
  pool.end();
});
