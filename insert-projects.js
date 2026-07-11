// Quick script to insert missing projects directly into DB
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString && connectionString.includes('neon.tech');
const pool = new Pool({ connectionString, ssl: isNeon ? { rejectUnauthorized: false } : false });

const newProjects = [
  {
    title: "Jotun Fire Alarm System",
    client_name: "Jotun Paint Manufacturing",
    location: "Addis Ababa, Ethiopia",
    description: "Comprehensive fire alarm system installation across Jotun's paint manufacturing facility to ensure employee safety and protect high-value production equipment.",
    full_detail: "Jotun's manufacturing plant required a robust fire detection and alarm solution suitable for a high-risk industrial environment. We installed an addressable fire alarm control panel, heat detectors in the production areas, smoke detectors in office and storage zones, and manual call points at all exits. The system is integrated with the site's emergency evacuation plan, providing immediate zone-based alerts to the safety team and automatic notification to local fire services.",
    benefit: ["Addressable zone detection", "Industrial-grade heat detectors", "Automatic emergency notification", "Full site evacuation coverage", "24/7 monitoring capability", "Compliance with Ethiopian fire safety standards"],
    category: "Alarm system",
    image: "/assets/service/jotun_fire_alarm.webp",
    show_on_home: true
  },
  {
    title: "Ethiopian Insurance Corporation Fire Alarm",
    client_name: "Ethiopian Insurance Corporation",
    location: "Addis Ababa, Ethiopia",
    description: "Full-scale fire alarm system installation across the Ethiopian Insurance Corporation's corporate headquarters to protect staff, records, and critical infrastructure.",
    full_detail: "Ethiopian Insurance Corporation needed a reliable fire alarm system to safeguard their multi-floor headquarters building. We deployed a conventional fire alarm control panel with smoke detectors in all office floors, server room heat detectors, break-glass manual call points on every floor landing, and ceiling-mounted sounders for building-wide alerts. The installation was completed with full wiring documentation and staff training on emergency procedures.",
    benefit: ["Multi-floor smoke detection", "Server room heat detection", "Building-wide alarm sounders", "Break-glass manual call points", "Emergency procedure training", "Full wiring documentation"],
    category: "Alarm system",
    image: "/assets/service/eic_fire_alarm.webp",
    show_on_home: true
  },
  {
    title: "Ethiopian Insurance Corporation Door Lock",
    client_name: "Ethiopian Insurance Corporation",
    location: "Addis Ababa, Ethiopia",
    description: "Installation of Biometric Smart Video Door Locks at the Ethiopian Insurance Corporation to enforce strict access control for sensitive departments and server rooms.",
    full_detail: "Following the fire alarm project, Ethiopian Insurance Corporation engaged us to upgrade access control across their headquarters. We installed Biometric Smart Video Door Locks on the executive floor, server room, and records vault. Each lock supports fingerprint recognition, PIN code, and RFID card access, with a built-in camera capturing every entry attempt. Management receives real-time alerts for unrecognised access attempts and can remotely lock or unlock any door via the mobile app.",
    benefit: ["Biometric fingerprint access", "Built-in entry camera", "Remote lock/unlock via app", "Real-time intrusion alerts", "RFID and PIN backup access", "Complete access audit trail"],
    category: "Smart Door Locks",
    image: "/assets/service/eic_door_lock.webp",
    show_on_home: false
  }
];

async function run() {
  try {
    // Show current projects
    const current = await pool.query('SELECT id, title FROM projects ORDER BY id;');
    console.log('\n📋 Current projects in DB:');
    current.rows.forEach(r => console.log(`  [${r.id}] ${r.title}`));

    // Create unique index if not exists
    await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_title ON projects(title);`);

    // Insert new projects
    console.log('\n🌱 Inserting new projects...');
    for (const p of newProjects) {
      const result = await pool.query(
        `INSERT INTO projects (title, client_name, location, description, full_detail, benefit, category, image, show_on_home)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (title) DO NOTHING
         RETURNING id, title;`,
        [p.title, p.client_name, p.location, p.description, p.full_detail, p.benefit, p.category, p.image, p.show_on_home]
      );
      if (result.rows.length > 0) {
        console.log(`  ✅ Inserted: [${result.rows[0].id}] ${result.rows[0].title}`);
      } else {
        console.log(`  ⏭️  Already exists: ${p.title}`);
      }
    }

    // Show final state
    const after = await pool.query('SELECT id, title, category FROM projects ORDER BY id;');
    console.log('\n📋 Final projects in DB:');
    after.rows.forEach(r => console.log(`  [${r.id}] ${r.title} (${r.category})`));

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
