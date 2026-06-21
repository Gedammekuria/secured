import pool from './server/db.js';

const defaultServices = [
  {
    category: "CCTV Installation",
    icon: "Camera",
    tagline: "See everything, miss nothing.",
    cards: [
      {
        title: "Outdoor Cameras",
        description: "Weatherproof Outdoor cameras with night vision and motion detection. Covers driveways, gardens, and perimeters 24/7.",
        image: "/assets/service/outdoor camera 1.webp"
      },
      {
        title: "Indoor Cameras",
        description: "A wide-angle lenses and two-way audio. Monitor your home's interior from your smartphone.",
        image: "/assets/service/indoor camera 1.webp"
      },
      {
        title: "Remote Access",
        description: "You can view any incidence from your property by using  smartphone everywhere remotely.",
        image: "/assets/service/mobile view.jpg"
      }
    ]
  },
  {
    category: "Alarm Systems",
    icon: "Bell",
    tagline: "Alert before intrusion happens.",
    cards: [
      {
        title: "Ajax Alarm System",
        description: "It is a wireless security technology that protects against intrusion, fire, and flooding. It's the most awarded and reliable smart home/commercial security solutions.",
        image: "/assets/service/ajax detector.webp"
      },
      {
        title: "GSM Burglare alarm System",
        description: "A wireless security alarm that uses GSM (Global System for Mobile Communications) cellular technology essentially a SIM card to send alerts, notifications, and alarm signals over mobile phone networks.",
        image: "/assets/service/burglar.webp"
      },
      {
        title: "Ajax Remote Control",
        description: "Our systems are simple to access remotely with cellphone ",
        image: "/assets/service/ajax control.jpg"
      }
    ]
  }
];

const defaultProjects = [
  {
    title: "Amibara Properties CCTV Installation",
    client_name: "Amibara Properties",
    location: "Addis Ababa, Ethiopia",
    description: "The client needed a cost-effective, high-definition security system with zero blind spots, local video backup redundancy, and secure remote access.",
    full_detail: "A massive security deployment for a large commercial properties group. We engineered a high resolution IP camera network designed for 360-degree blind-spot coverage. The system features advanced motion analytics to monitor high-traffic areas and thermal detection for sensitive zones.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote global access", "Motion detection", "Minimized risks of employee's and property loses", "Take immediate action for the problem"],
    category: "CCTV Camera",
    image: "/assets/service/amibara project.JPG",
    show_on_home: true
  },
  {
    title: "Jotun CCTV Installation",
    client_name: "Jotun Paint manufacturing",
    location: "Addis Ababa, Ethiopia",
    description: "the client needed cctv camera to control his employe's and their properties any where to reduce wastage and increase the productivity of the manufacturing plant.",
    full_detail: "Surveillance in industry is vital to control the employees and their properties any where to reduce wastage and increase the productivity of the manufacturing plant. We deployed explosion-proof CCTV housings and long-range thermal cameras to monitor process equipment and ensure site safety.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote access from any where", "Increase productivity", "Use their time properly", "Highly minimized the wastage"],
    category: "CCTV Camera",
    image: "/assets/service/jotun cctv.jpg",
    show_on_home: true
  },
  {
    title: "Oasis Hotel Apartment CCTV Installation",
    client_name: "Oasis Hotel Apartment",
    location: "Addis Ababa, Ethiopia",
    description: "Comprehensive surveillance system for guest safety and high-traffic area monitoring across multiple floors.",
    full_detail: "For Oasis Hotel Apartment, we installaed  a CCTV camera security system. The installation includes high-definition dome and bullet cameras in hallways and common areass. The system provides real-time monitoring and advanced playback capabilities for management.",
    benefit: ["Multi-floor coverage", "Guest privacy optimization", "24/7 hotel monitoring", "Mobile access for management"],
    category: "CCTV Camera",
    image: "/assets/service/oasishotel.png",
    show_on_home: false
  },
  {
    title: "Sunrise Real Estate CCTV Installation",
    client_name: "Sunrise Real Estate",
    location: "Addis Ababa, Ethiopia",
    description: "We installed high-definition CCTV surveillance system for Sunrise Real Estate to safeguard property assets and ensure tenant security .",
    full_detail: "Sunrise Real Estate required a CCTV security solution for their residential complex. We installed the Cameras with out blined spot.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Remote global access", "Motion-triggered alerts", "Night vision excellence"],
    category: "CCTV Camera",
    image: "/assets/service/sunrise.JPG",
    show_on_home: false
  },
  {
    title: "Maryod Bakery CCTV Installation",
    client_name: "Maryod Bakery",
    location: "Addis Ababa, Ethiopia",
    description: "Professional CCTV camera installation designed to provide continuous, high quality monitoring.",
    full_detail: "We designed a powerful CCTV system for Maryod Bakery. Key focus areas include the point of sale for transaction security and the production area to monitor quality control. The high-resolution cameras provide clear footage even in low-light conditions during night shifts.",
    benefit: ["24/7 continuous recording", "Elimination of blind spots", "Quality control oversight", "Remote operational checks", "POS transaction monitoring", "Time managment"],
    category: "CCTV Camera",
    image: "/assets/service/maryod_bakery.jpg",
    show_on_home: false
  }
];

async function migrate() {
  try {
    console.log('🔄 Starting database migration...');

    // Check what columns services table currently has
    const colCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'services' ORDER BY ordinal_position
    `);
    console.log('Current services columns:', colCheck.rows.map(r => r.column_name));

    // Drop and recreate services table with correct schema
    console.log('🗑️  Dropping and recreating services table...');
    await pool.query('DROP TABLE IF EXISTS services CASCADE;');
    await pool.query(`
      CREATE TABLE services (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        tagline VARCHAR(255),
        cards JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ services table created.');

    // Drop and recreate projects table with correct schema
    console.log('🗑️  Dropping and recreating projects table...');
    await pool.query('DROP TABLE IF EXISTS projects CASCADE;');
    await pool.query(`
      CREATE TABLE projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        client_name VARCHAR(255),
        location VARCHAR(255),
        description TEXT,
        full_detail TEXT,
        benefit TEXT[] DEFAULT '{}',
        category VARCHAR(100),
        image VARCHAR(255),
        show_on_home BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ projects table created.');

    // Create database indexes for high performance retrievals
    console.log('⚡ Creating database index on projects...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_show_on_home ON projects(show_on_home) WHERE show_on_home = true;
    `);
    console.log('✅ projects index created.');

    // Seed services
    console.log('🌱 Seeding services...');
    for (const s of defaultServices) {
      await pool.query(
        'INSERT INTO services (category, icon, tagline, cards) VALUES ($1, $2, $3, $4)',
        [s.category, s.icon, s.tagline, JSON.stringify(s.cards)]
      );
    }
    console.log(`✅ Inserted ${defaultServices.length} services.`);

    // Seed projects
    console.log('🌱 Seeding projects...');
    for (const p of defaultProjects) {
      await pool.query(
        'INSERT INTO projects (title, client_name, location, description, full_detail, benefit, category, image, show_on_home) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [p.title, p.client_name, p.location, p.description, p.full_detail, p.benefit, p.category, p.image, p.show_on_home]
      );
    }
    console.log(`✅ Inserted ${defaultProjects.length} projects.`);

    // Verify counts
    const svc = await pool.query('SELECT COUNT(*) FROM services');
    const prj = await pool.query('SELECT COUNT(*) FROM projects');
    console.log(`\n📊 Final counts: services=${svc.rows[0].count}, projects=${prj.rows[0].count}`);
    console.log('🎉 Migration complete!');
  } catch(e) {
    console.error('❌ Migration error:', e.message);
    console.error(e);
  }
  process.exit(0);
}

migrate();
