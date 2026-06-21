import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory mock inquiries for database simulation mode
let mockInquiries = [
  {
    id: 'mock-1',
    source: 'quote',
    full_name: 'Abebe Kebede',
    initial_contact: 'abebe@example.com',
    alternative_contact: '+251911223344',
    company_name: 'Kebede Trading PLC',
    location: 'Addis Ababa, Bole',
    budget: '150,000 - 500,000 ETB',
    inquiry_type: ['CCTV Systems', 'Alarm Systems'],
    custom_inquiry: null,
    num_cameras: 8,
    footage_duration: '1 Month',
    cctv_other: 'Night vision, remote view',
    alarm_property_type: 'Commercial',
    num_sensors: 12,
    alarm_system_type: 'Wireless (Ajax)',
    alarm_timeframe: 'Based on your schedule',
    alarm_installed_system: 'Paradox',
    message: 'Please provide a detailed site assessment and proposal.',
    status: 'pending',
    notifications: [],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'mock-2',
    source: 'contact',
    full_name: 'Martha Tesfaye',
    initial_contact: '+251920334455',
    alternative_contact: 'martha@gmail.com',
    company_name: null,
    location: 'Hawassa',
    budget: 'Under 50,000 ETB',
    inquiry_type: ['Alarm Systems'],
    custom_inquiry: null,
    num_cameras: null,
    footage_duration: null,
    cctv_other: null,
    alarm_property_type: 'Residential',
    num_sensors: 4,
    alarm_system_type: 'GSM Burglar Alarm',
    alarm_timeframe: null,
    alarm_installed_system: null,
    message: 'Looking for a simple burglar alarm system for my villa.',
    status: 'pending',
    notifications: [],
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Default Mock Data for Services and Projects
const defaultServices = [
  {
    id: 1,
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
    id: 2,
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
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    id: 5,
    title: "Maryod Bakery CCTV Installation ",
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

let mockServices = JSON.parse(JSON.stringify(defaultServices));
let mockProjects = JSON.parse(JSON.stringify(defaultProjects));

// Initialize database tables if not exists
async function initDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.log('🔴 Database connection skipped: DATABASE_URL is not set.');
    return;
  }

  try {
    console.log('⏳ Connecting to Postgres and checking tables...');
    
    // Create inquiries table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        source VARCHAR(50) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        initial_contact VARCHAR(255) NOT NULL,
        alternative_contact VARCHAR(255),
        company_name VARCHAR(255),
        location VARCHAR(255),
        budget VARCHAR(100),
        inquiry_type TEXT[] DEFAULT '{}',
        custom_inquiry TEXT,
        num_cameras INTEGER,
        footage_duration VARCHAR(100),
        cctv_other TEXT,
        alarm_property_type VARCHAR(100),
        num_sensors INTEGER,
        alarm_system_type VARCHAR(100),
        alarm_timeframe VARCHAR(100),
        alarm_installed_system VARCHAR(255),
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        timeframe VARCHAR(100),
        installedsystem VARCHAR(255)
      );
    `;
    await pool.query(createTableQuery);

    // Create services table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        icon VARCHAR(100),
        tagline VARCHAR(255),
        cards JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create projects table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
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

    // Migration to add status column if it doesn't exist (for existing tables)
    await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
    `);
    await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS alarm_timeframe VARCHAR(100);
    `);
    await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS alarm_installed_system VARCHAR(255);
    `);
    await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '[]';
    `);
    await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS timeframe VARCHAR(100);
    `);
    await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS installedsystem VARCHAR(255);
    `);

    // Create database indexes for high performance retrievals
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
      CREATE INDEX IF NOT EXISTS idx_projects_show_on_home ON projects(show_on_home) WHERE show_on_home = true;
    `);

    // Seed services if table is empty
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services;');
    if (parseInt(servicesCount.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial services table...');
      for (const s of defaultServices) {
        await pool.query(
          'INSERT INTO services (category, icon, tagline, cards) VALUES ($1, $2, $3, $4);',
          [s.category, s.icon, s.tagline, JSON.stringify(s.cards)]
        );
      }
    }

    // Seed projects if table is empty
    const projectsCount = await pool.query('SELECT COUNT(*) FROM projects;');
    if (parseInt(projectsCount.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial projects table...');
      for (const p of defaultProjects) {
        await pool.query(
          'INSERT INTO projects (title, client_name, location, description, full_detail, benefit, category, image, show_on_home) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);',
          [p.title, p.client_name, p.location, p.description, p.full_detail, p.benefit, p.category, p.image, p.show_on_home]
        );
      }
    }

    console.log('🟢 Database initialized successfully. Tables are ready.');
  } catch (err) {
    console.error('🔴 Database initialization failed:', err.message);
  }
}

// Route to handle lead inquiries (from QuotePage and ContactPage)
app.post('/api/inquiries', async (req, res) => {
  const {
    id,
    source,
    fullName,
    initialContact,
    alternativeContact,
    companyName,
    location,
    budget,
    inquiryType,
    customInquiry,
    numCameras,
    footageDuration,
    cctvOther,
    alarmPropertyType,
    numSensors,
    alarmSystemType,
    alarmTimeframe,
    alarmInstalledSystem,
    message,
    timeframe,
    installedsystem,
    previousinstalled
  } = req.body;

  // Validation
  if (!source || !fullName || !initialContact) {
    return res.status(400).json({
      error: 'Validation Error: "source", "fullName", and "initialContact" are required.'
    });
  }

  if (source !== 'quote' && source !== 'contact') {
    return res.status(400).json({
      error: 'Validation Error: "source" must be either "quote" or "contact".'
    });
  }

  // Formatting values
  const formattedInquiryType = Array.isArray(inquiryType) ? inquiryType : [];
  const parsedNumCameras = numCameras !== undefined ? (numCameras !== null && numCameras !== '' ? parseInt(numCameras, 10) : null) : undefined;
  const parsedNumSensors = numSensors !== undefined ? (numSensors !== null && numSensors !== '' ? parseInt(numSensors, 10) : null) : undefined;
  const cctvTimeframe = timeframe || null;
  const cctvInstalledSystem = installedsystem || previousinstalled || null;

  // Simulation fallback if database is not configured
  if (!process.env.DATABASE_URL) {
    if (id) {
      const existingIndex = mockInquiries.findIndex(item => String(item.id) === String(id));
      if (existingIndex !== -1) {
        const existingRecord = mockInquiries[existingIndex];
        
        const getValue = (newValue, existingValue) => {
          if (newValue !== undefined && newValue !== null && newValue !== '') return newValue;
          return existingValue;
        };

        const finalInquiryType = Array.isArray(inquiryType) && inquiryType.length > 0 ? inquiryType : existingRecord.inquiry_type;

        mockInquiries[existingIndex] = {
          ...existingRecord,
          source: getValue(source, existingRecord.source),
          full_name: getValue(fullName, existingRecord.full_name),
          initial_contact: getValue(initialContact, existingRecord.initial_contact),
          alternative_contact: getValue(alternativeContact, existingRecord.alternative_contact),
          company_name: getValue(companyName, existingRecord.company_name),
          location: getValue(location, existingRecord.location),
          budget: getValue(budget, existingRecord.budget),
          inquiry_type: finalInquiryType,
          custom_inquiry: getValue(customInquiry, existingRecord.custom_inquiry),
          num_cameras: (parsedNumCameras !== undefined && parsedNumCameras !== null) ? parsedNumCameras : existingRecord.num_cameras,
          footage_duration: getValue(footageDuration, existingRecord.footage_duration),
          cctv_other: getValue(cctvOther, existingRecord.cctv_other),
          alarm_property_type: getValue(alarmPropertyType, existingRecord.alarm_property_type),
          num_sensors: (parsedNumSensors !== undefined && parsedNumSensors !== null) ? parsedNumSensors : existingRecord.num_sensors,
          alarm_system_type: getValue(alarmSystemType, existingRecord.alarm_system_type),
          alarm_timeframe: getValue(alarmTimeframe, existingRecord.alarm_timeframe),
          alarm_installed_system: getValue(alarmInstalledSystem, existingRecord.alarm_installed_system),
          message: getValue(message, existingRecord.message),
          timeframe: getValue(cctvTimeframe, existingRecord.timeframe),
          installedsystem: getValue(cctvInstalledSystem, existingRecord.installedsystem)
        };
        
        console.log(`📝 [SIMULATED INQUIRY UPDATE] Updated mock inquiry. ID: ${id}`);
        return res.status(200).json({
          success: true,
          message: 'Inquiry updated successfully (Simulated fallback - Database URL not set).',
          id: id,
          createdAt: existingRecord.created_at
        });
      }
    }

    const mockRecord = {
      id: `simulated-${Date.now()}`,
      source,
      full_name: fullName,
      initial_contact: initialContact,
      alternative_contact: alternativeContact || null,
      company_name: companyName || null,
      location: location || null,
      budget: budget || null,
      inquiry_type: formattedInquiryType,
      custom_inquiry: customInquiry || null,
      num_cameras: parsedNumCameras !== undefined && parsedNumCameras !== null && !isNaN(parsedNumCameras) ? parsedNumCameras : null,
      footage_duration: footageDuration || null,
      cctv_other: cctvOther || null,
      alarm_property_type: alarmPropertyType || null,
      num_sensors: parsedNumSensors !== undefined && parsedNumSensors !== null && !isNaN(parsedNumSensors) ? parsedNumSensors : null,
      alarm_system_type: alarmSystemType || null,
      alarm_timeframe: alarmTimeframe || null,
      alarm_installed_system: alarmInstalledSystem || null,
      message: message || null,
      status: 'pending',
      created_at: new Date().toISOString(),
      timeframe: cctvTimeframe || null,
      installedsystem: cctvInstalledSystem || null
    };
    
    // Add to simulated memory
    mockInquiries.unshift(mockRecord);
    
    console.log(`📝 [SIMULATED INQUIRY] Saved mock inquiry to memory. Current count: ${mockInquiries.length}`);
    return res.status(201).json({
      success: true,
      message: 'Inquiry received successfully (Simulated fallback - Database URL not set).',
      id: mockRecord.id,
      createdAt: mockRecord.created_at
    });
  }

  // Database mode (with Postgres)
  const numericId = parseInt(id, 10);
  if (id && !isNaN(numericId)) {
    try {
      const existingResult = await pool.query('SELECT * FROM inquiries WHERE id = $1;', [numericId]);
      if (existingResult.rows.length > 0) {
        const existingRecord = existingResult.rows[0];

        const getValue = (newValue, existingValue) => {
          if (newValue !== undefined && newValue !== null && newValue !== '') return newValue;
          return existingValue;
        };

        const finalSource = getValue(source, existingRecord.source);
        const finalFullName = getValue(fullName, existingRecord.full_name);
        const finalInitialContact = getValue(initialContact, existingRecord.initial_contact);
        const finalAlternativeContact = getValue(alternativeContact, existingRecord.alternative_contact);
        const finalCompanyName = getValue(companyName, existingRecord.company_name);
        const finalLocation = getValue(location, existingRecord.location);
        const finalBudget = getValue(budget, existingRecord.budget);
        const finalInquiryType = Array.isArray(inquiryType) && inquiryType.length > 0 ? inquiryType : existingRecord.inquiry_type;
        const finalCustomInquiry = getValue(customInquiry, existingRecord.custom_inquiry);
        const finalNumCameras = (parsedNumCameras !== undefined && parsedNumCameras !== null) ? parsedNumCameras : existingRecord.num_cameras;
        const finalFootageDuration = getValue(footageDuration, existingRecord.footage_duration);
        const finalCctvOther = getValue(cctvOther, existingRecord.cctv_other);
        const finalAlarmPropertyType = getValue(alarmPropertyType, existingRecord.alarm_property_type);
        const finalNumSensors = (parsedNumSensors !== undefined && parsedNumSensors !== null) ? parsedNumSensors : existingRecord.num_sensors;
        const finalAlarmSystemType = getValue(alarmSystemType, existingRecord.alarm_system_type);
        const finalAlarmTimeframe = getValue(alarmTimeframe, existingRecord.alarm_timeframe);
        const finalAlarmInstalledSystem = getValue(alarmInstalledSystem, existingRecord.alarm_installed_system);
        const finalMessage = getValue(message, existingRecord.message);
        const finalCctvTimeframe = getValue(cctvTimeframe, existingRecord.timeframe);
        const finalCctvInstalledSystem = getValue(cctvInstalledSystem, existingRecord.installedsystem);

        const updateQuery = `
          UPDATE inquiries SET
            source = $1,
            full_name = $2,
            initial_contact = $3,
            alternative_contact = $4,
            company_name = $5,
            location = $6,
            budget = $7,
            inquiry_type = $8,
            custom_inquiry = $9,
            num_cameras = $10,
            footage_duration = $11,
            cctv_other = $12,
            alarm_property_type = $13,
            num_sensors = $14,
            alarm_system_type = $15,
            alarm_timeframe = $16,
            alarm_installed_system = $17,
            message = $18,
            timeframe = $19,
            installedsystem = $20
          WHERE id = $21
          RETURNING id, created_at;
        `;

        const updateValues = [
          finalSource,
          finalFullName,
          finalInitialContact,
          finalAlternativeContact || null,
          finalCompanyName || null,
          finalLocation || null,
          finalBudget || null,
          finalInquiryType,
          finalCustomInquiry || null,
          finalNumCameras,
          finalFootageDuration || null,
          finalCctvOther || null,
          finalAlarmPropertyType || null,
          finalNumSensors,
          finalAlarmSystemType || null,
          finalAlarmTimeframe || null,
          finalAlarmInstalledSystem || null,
          finalMessage || null,
          finalCctvTimeframe || null,
          finalCctvInstalledSystem || null,
          numericId
        ];

        const updateResult = await pool.query(updateQuery, updateValues);
        const record = updateResult.rows[0];

        console.log(`📥 Updated inquiry successfully (ID: ${record.id}, Source: ${finalSource}, Name: ${finalFullName})`);

        return res.status(200).json({
          success: true,
          message: 'Inquiry updated successfully.',
          id: record.id,
          createdAt: record.created_at
        });
      }
    } catch (err) {
      console.error('🔴 Database update failed:', err.message);
      return res.status(500).json({
        error: 'Internal Server Error: Failed to update the inquiry in the database.',
        details: err.message
      });
    }
  }

  // Insert mode
  try {
    const insertQuery = `
      INSERT INTO inquiries (
        source,
        full_name,
        initial_contact,
        alternative_contact,
        company_name,
        location,
        budget,
        inquiry_type,
        custom_inquiry,
        num_cameras,
        footage_duration,
        cctv_other,
        alarm_property_type,
        num_sensors,
        alarm_system_type,
        alarm_timeframe,
        alarm_installed_system,
        message,
        status,
        timeframe,
        installedsystem
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id, created_at;
    `;

    const values = [
      source,
      fullName,
      initialContact,
      alternativeContact || null,
      companyName || null,
      location || null,
      budget || null,
      formattedInquiryType,
      customInquiry || null,
      parsedNumCameras !== undefined && parsedNumCameras !== null && !isNaN(parsedNumCameras) ? parsedNumCameras : null,
      footageDuration || null,
      cctvOther || null,
      alarmPropertyType || null,
      parsedNumSensors !== undefined && parsedNumSensors !== null && !isNaN(parsedNumSensors) ? parsedNumSensors : null,
      alarmSystemType || null,
      alarmTimeframe || null,
      alarmInstalledSystem || null,
      message || null,
      'pending',
      cctvTimeframe || null,
      cctvInstalledSystem || null
    ];

    const result = await pool.query(insertQuery, values);
    const record = result.rows[0];

    console.log(`📥 Saved new inquiry successfully (ID: ${record.id}, Source: ${source}, Name: ${fullName})`);

    return res.status(201).json({
      success: true,
      message: 'Inquiry saved successfully.',
      id: record.id,
      createdAt: record.created_at
    });
  } catch (err) {
    console.error('🔴 Database insert failed:', err.message);
    return res.status(500).json({
      error: 'Internal Server Error: Failed to save the inquiry to the database.',
      details: err.message
    });
  }
});

// Health check and connectivity endpoint
app.get('/api/health', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json({
      status: 'healthy',
      database: 'simulated (DATABASE_URL is not set)',
      uptime: process.uptime()
    });
  }
  try {
    await pool.query('SELECT 1');
    return res.json({
      status: 'healthy',
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (err) {
    return res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message
    });
  }
});

// Admin Authentication Middleware
function authenticateAdmin(req, res, next) {
  // Reload environment variables dynamically
  dotenv.config({ override: true });

  const authHeader = req.headers.authorization;
  const expectedToken = process.env.ADMIN_TOKEN || 'safehive_secret_token_2026';
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing session token.' });
  }
  
  const token = authHeader.split(' ')[1];
  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized: Invalid session token.' });
  }
  
  next();
}

// Admin Login
app.post('/api/admin/login', (req, res) => {
  // Reload environment variables dynamically to pick up any changes to .env
  dotenv.config({ override: true });

  const { email, password } = req.body;
  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@safehive.com';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'safehiveadmin';
  const secretToken = process.env.ADMIN_TOKEN || 'safehive_secret_token_2026';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (email.toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword) {
    return res.json({
      success: true,
      token: secretToken
    });
  } else {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
});

// Temporary store for reset codes: email -> { code, expiresAt }
const resetCodes = new Map();

// Helper to update password in .env file
function updateEnvPassword(newPassword) {
  try {
    const envPath = fileURLToPath(new URL('../.env', import.meta.url));
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, 'utf8');
      if (content.includes('ADMIN_PASSWORD=')) {
        content = content.replace(/ADMIN_PASSWORD=.*/, `ADMIN_PASSWORD=${newPassword}`);
      } else {
        content += `\nADMIN_PASSWORD=${newPassword}`;
      }
      fs.writeFileSync(envPath, content, 'utf8');
      // Also update process.env
      process.env.ADMIN_PASSWORD = newPassword;
      console.log('✅ Updated ADMIN_PASSWORD in .env');
      return true;
    }
  } catch (err) {
    console.error('Failed to update .env file:', err.message);
  }
  return false;
}

// Helper to send reset code email
async function sendResetCodeEmail(recipient, code) {
  const subject = `SafeHive Security — Admin Password Reset Code`;
  const body = `Dear SafeHive Admin,\n\nYou requested a password reset code for the admin console.\n\nYour 6-digit verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you did not request this, please secure your admin credentials immediately.\n\nBest regards,\nThe SafeHive Security Team\nwww.safehive.com`;

  const logEntry = `
========================================
[EMAIL SENT VIA SAFEHIVE SYSTEM]
Timestamp: ${new Date().toISOString()}
Recipient: ${recipient} (Admin Reset Code)
Subject:   ${subject}
Body:
${body}
========================================
`;
  try {
    fs.appendFileSync('notifications_log.txt', logEntry, 'utf8');
    console.log(`✉️ [NOTIFICATION LOGGED] Reset code written to notifications_log.txt for ${recipient}`);
  } catch (err) {
    console.error('Failed to write reset email to log file:', err.message);
  }

  const isEmail = recipient && recipient.includes('@');
  if (isEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"SafeHive Security" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject: subject,
        text: body,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('⚡ Reset code email sent successfully via SMTP:', info.messageId);
      return { success: true, method: 'email', messageId: info.messageId };
    } catch (err) {
      console.error('🔴 Failed to send reset code email via SMTP:', err.message);
      return { success: true, method: 'simulation_fallback', error: err.message };
    }
  }

  return { success: true, method: 'simulation' };
}

// Helper to send reset confirmation email
async function sendResetConfirmationEmail(recipient) {
  const subject = `SafeHive Security — Admin Password Reset Successful`;
  const body = `Dear SafeHive Admin,\n\nYour SafeHive Admin account password has been successfully reset.\n\nYou can now log in using your new password.\n\nBest regards,\nThe SafeHive Security Team\nwww.safehive.com`;

  const logEntry = `
========================================
[EMAIL SENT VIA SAFEHIVE SYSTEM]
Timestamp: ${new Date().toISOString()}
Recipient: ${recipient} (Admin Reset Confirmation)
Subject:   ${subject}
Body:
${body}
========================================
`;
  try {
    fs.appendFileSync('notifications_log.txt', logEntry, 'utf8');
    console.log(`✉️ [NOTIFICATION LOGGED] Reset confirmation written to notifications_log.txt for ${recipient}`);
  } catch (err) {
    console.error('Failed to write reset confirmation to log file:', err.message);
  }

  const isEmail = recipient && recipient.includes('@');
  if (isEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"SafeHive Security" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject: subject,
        text: body,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error('🔴 Failed to send reset confirmation email via SMTP:', err.message);
    }
  }
}

// Admin Forgot Password - Request Verification Code
app.post('/api/admin/forgot-password', async (req, res) => {
  // Reload environment variables dynamically
  dotenv.config({ override: true });

  const { email } = req.body;
  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@safehive.com';

  if (!email) {
    return res.status(400).json({ error: 'Operator email is required.' });
  }

  if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
    return res.status(404).json({ error: 'No operator found with this email address.' });
  }

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  resetCodes.set(email.toLowerCase(), { code, expiresAt });

  // Send the email
  const emailRes = await sendResetCodeEmail(email, code);

  return res.json({
    success: true,
    message: 'A verification code has been sent to your operator email.',
    simulated: emailRes.method !== 'email'
  });
});

// Admin Reset Password - Verify Code & Update Password
app.post('/api/admin/reset-password', async (req, res) => {
  // Reload environment variables dynamically
  dotenv.config({ override: true });

  const { email, code, newPassword } = req.body;
  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@safehive.com';

  if (!email || !code || !newPassword) {
    return res.status(400).json({ error: 'Email, verification code, and new password are required.' });
  }

  if (email.toLowerCase() !== expectedEmail.toLowerCase()) {
    return res.status(404).json({ error: 'No operator found with this email address.' });
  }

  const record = resetCodes.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({ error: 'No active password reset request found for this email.' });
  }

  if (record.code !== code.trim()) {
    return res.status(400).json({ error: 'Invalid verification code.' });
  }

  if (Date.now() > record.expiresAt) {
    resetCodes.delete(email.toLowerCase());
    return res.status(400).json({ error: 'Verification code has expired. Please request a new one.' });
  }

  // Code is valid! Update password
  const updated = updateEnvPassword(newPassword);

  // Clear verification code
  resetCodes.delete(email.toLowerCase());

  // Send reset confirmation email
  await sendResetConfirmationEmail(email);

  return res.json({
    success: true,
    message: 'Your password has been successfully reset. You can now login with your new password.',
    envUpdated: updated
  });
});

// Admin Get Inquiries
app.get('/api/admin/inquiries', authenticateAdmin, async (req, res) => {
  if (!process.env.DATABASE_URL) {
    // Return the in-memory array in simulation mode
    return res.json(mockInquiries);
  }

  try {
    const result = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC;');
    return res.json(result.rows);
  } catch (err) {
    console.error('🔴 Failed to fetch inquiries from DB:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve inquiries from database.' });
  }
});

// Admin Delete Inquiry
app.delete('/api/admin/inquiries/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  if (!process.env.DATABASE_URL) {
    // Filter out in-memory array in simulation mode
    const exists = mockInquiries.some(item => item.id === id);
    if (!exists) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    mockInquiries = mockInquiries.filter(item => item.id !== id);
    console.log(`🗑️ [SIMULATED] Deleted inquiry ID: ${id}`);
    return res.json({ success: true, message: 'Inquiry deleted successfully (Simulated).' });
  }

  try {
    const result = await pool.query('DELETE FROM inquiries WHERE id = $1 RETURNING id;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Inquiry not found in database.' });
    }
    console.log(`🗑️ Deleted inquiry ID: ${id} from database.`);
    return res.json({ success: true, message: 'Inquiry deleted successfully from database.' });
  } catch (err) {
    console.error('🔴 Failed to delete inquiry from DB:', err.message);
    return res.status(500).json({ error: 'Failed to delete inquiry from database.' });
  }
});


// Helper to send email notification to the client regarding inquiry status change
async function sendNotificationEmail(inquiry, status) {
  const name = inquiry.full_name || 'Valued Customer';
  const recipient = inquiry.initial_contact;
  const isEmail = recipient && recipient.includes('@');
  
  const serviceText = Array.isArray(inquiry.inquiry_type) && inquiry.inquiry_type.length > 0 
    ? inquiry.inquiry_type.join(', ') 
    : (inquiry.source === 'quote' ? 'Security Quote Request' : 'Contact Inquiry');

  let subject = '';
  let body = '';

  switch (status) {
    case 'accepted':
      subject = `SafeHive Security — Request Accepted (Ref: ${inquiry.id})`;
      body = `Dear ${name},\n\nThank you for choosing SafeHive Security.\n\nWe are pleased to inform you that your request for "${serviceText}" has been accepted by our team.\n\nOur security experts are currently reviewing your requirements and will reach out to you shortly to schedule an onsite assessment or discuss next steps.\n\nBest regards,\nThe SafeHive Security Team\nwww.safehive.com`;
      break;
    case 'progress':
      subject = `SafeHive Security — Project In Progress (Ref: ${inquiry.id})`;
      body = `Dear ${name},\n\nWe are pleased to update you that your security installation project for "${serviceText}" is now officially IN PROGRESS.\n\nOur engineering and installation crews are coordinating the equipment and setups. We will keep you posted on the daily milestones.\n\nBest regards,\nThe SafeHive Security Team\nwww.safehive.com`;
      break;
    case 'finished':
      subject = `SafeHive Security — Project Completed! (Ref: ${inquiry.id})`;
      body = `Dear ${name},\n\nGreat news! Your SafeHive Security system installation for "${serviceText}" has been marked as FINISHED.\n\nWe trust that our setup meets your security requirements. A customer service representative will follow up to ensure your complete satisfaction and guide you through system operations.\n\nThank you for trusting SafeHive to secure what matters most.\n\nBest regards,\nThe SafeHive Security Team\nwww.safehive.com`;
      break;
    default:
      subject = `SafeHive Security — Inquiry Update (Ref: ${inquiry.id})`;
      body = `Dear ${name},\n\nThis is an automated update regarding your security inquiry. Your inquiry status has been updated to: ${status.toUpperCase()}.\n\nBest regards,\nThe SafeHive Security Team\nwww.safehive.com`;
  }

  // 1. Log to notifications_log.txt in root
  const logEntry = `
========================================
[EMAIL SENT VIA SAFEHIVE SYSTEM]
Timestamp: ${new Date().toISOString()}
Recipient: ${recipient} (${isEmail ? 'Email' : 'SMS/Phone Candidate'})
Subject:   ${subject}
Body:
${body}
========================================
`;
  try {
    fs.appendFileSync('notifications_log.txt', logEntry, 'utf8');
    console.log(`✉️ [NOTIFICATION LOGGED] Simulated email written to notifications_log.txt for ${recipient}`);
  } catch (err) {
    console.error('Failed to write simulated email to log file:', err.message);
  }

  // 2. Attempt real SMTP if configured
  if (isEmail && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const nodemailer = (await import('nodemailer')).default;
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: process.env.SMTP_FROM || `"SafeHive Security" <${process.env.SMTP_USER}>`,
        to: recipient,
        subject: subject,
        text: body,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('⚡ Real email notification sent successfully:', info.messageId);
      return { success: true, method: 'email', messageId: info.messageId, subject, preview: body };
    } catch (err) {
      console.error('🔴 Failed to send real SMTP email, falling back to simulator:', err.message);
      return { success: true, method: 'simulation_fallback', error: err.message, subject, preview: body };
    }
  }

  return { success: true, method: 'simulation', subject, preview: body };
}

// Admin Update Inquiry Status
app.put('/api/admin/inquiries/:id/status', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'accepted', 'progress', 'finished'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid or missing status value.' });
  }

  if (!process.env.DATABASE_URL) {
    // Simulation mode
    const index = mockInquiries.findIndex(item => String(item.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Inquiry not found.' });
    }
    mockInquiries[index].status = status;
    console.log(`📝 [SIMULATED STATUS UPDATE] Updated inquiry ${id} status to ${status}`);
    
    // Trigger notification
    const notifyRes = await sendNotificationEmail(mockInquiries[index], status);
    
    // Save to simulated notifications list
    const newNotify = {
      status,
      timestamp: new Date().toISOString(),
      recipient: mockInquiries[index].initial_contact,
      subject: notifyRes.subject,
      preview: notifyRes.preview,
      method: notifyRes.method
    };
    mockInquiries[index].notifications = mockInquiries[index].notifications || [];
    mockInquiries[index].notifications.push(newNotify);
    
    return res.json({ 
      success: true, 
      message: 'Status updated successfully (Simulated).',
      notification: newNotify
    });
  }

  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid numeric ID format.' });
    }

    const result = await pool.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING *;',
      [status, numericId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Inquiry not found in database.' });
    }

    console.log(`📥 Updated inquiry ID ${id} status to ${status} in database.`);
    
    // Trigger notification
    const notifyRes = await sendNotificationEmail(result.rows[0], status);

    // Save to notifications JSONB array in database
    const currentNotifications = result.rows[0].notifications || [];
    const newNotify = {
      status,
      timestamp: new Date().toISOString(),
      recipient: result.rows[0].initial_contact,
      subject: notifyRes.subject,
      preview: notifyRes.preview,
      method: notifyRes.method
    };
    currentNotifications.push(newNotify);

    await pool.query(
      'UPDATE inquiries SET notifications = $1 WHERE id = $2;',
      [JSON.stringify(currentNotifications), numericId]
    );

    return res.json({ 
      success: true, 
      message: 'Status updated successfully.',
      notification: newNotify
    });
  } catch (err) {
    console.error('🔴 Failed to update status in DB:', err.message);
    return res.status(500).json({ error: 'Failed to update status in database.' });
  }
});

// ── Public Services & Projects Endpoints ─────────────────────────────────────

// Get all services
app.get('/api/services', async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json(mockServices);
  }
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id ASC;');
    return res.json(result.rows);
  } catch (err) {
    console.error('Failed to get services:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve services.' });
  }
});

// Get projects (with optional showOnHome filtering)
app.get('/api/projects', async (req, res) => {
  const showOnHome = req.query.showOnHome === 'true';
  if (!process.env.DATABASE_URL) {
    let list = mockProjects;
    if (req.query.showOnHome !== undefined) {
      list = list.filter(p => p.show_on_home === showOnHome);
    }
    // Return formatted objects for frontend camelCase compatibility
    const formatted = list.map(p => ({
      id: p.id,
      title: p.title,
      clientName: p.client_name || p.clientName,
      location: p.location,
      description: p.description,
      fullDetail: p.full_detail || p.fullDetail,
      benefit: p.benefit || p.benefits || [],
      category: p.category,
      image: p.image,
      showOnHome: p.show_on_home
    }));
    return res.json(formatted);
  }
  try {
    let query = 'SELECT * FROM projects';
    let values = [];
    if (req.query.showOnHome !== undefined) {
      query += ' WHERE show_on_home = $1';
      values.push(showOnHome);
    }
    query += ' ORDER BY id ASC;';
    const result = await pool.query(query, values);
    const formatted = result.rows.map(r => ({
      id: r.id,
      title: r.title,
      clientName: r.client_name,
      location: r.location,
      description: r.description,
      fullDetail: r.full_detail,
      benefit: r.benefit || [],
      category: r.category,
      image: r.image,
      showOnHome: r.show_on_home
    }));
    return res.json(formatted);
  } catch (err) {
    console.error('Failed to get projects:', err.message);
    return res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
});

// ── Admin Services CRUD Endpoints ────────────────────────────────────────────

// Get all services for Admin
app.get('/api/admin/services', authenticateAdmin, async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json(mockServices);
  }
  try {
    const result = await pool.query('SELECT * FROM services ORDER BY id ASC;');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve services.' });
  }
});

// Create new service
app.post('/api/admin/services', authenticateAdmin, async (req, res) => {
  const { category, icon, tagline, cards } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  const formattedCards = Array.isArray(cards) ? cards : [];
  if (!process.env.DATABASE_URL) {
    const newService = {
      id: `simulated-s-${Date.now()}`,
      category,
      icon: icon || 'Camera',
      tagline: tagline || '',
      cards: formattedCards,
      created_at: new Date().toISOString()
    };
    mockServices.push(newService);
    return res.status(201).json(newService);
  }
  try {
    const result = await pool.query(
      'INSERT INTO services (category, icon, tagline, cards) VALUES ($1, $2, $3, $4) RETURNING *;',
      [category, icon || 'Camera', tagline || '', JSON.stringify(formattedCards)]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create service:', err.message);
    return res.status(500).json({ error: 'Failed to create service.' });
  }
});

// Update service
app.put('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { category, icon, tagline, cards } = req.body;
  if (!category) {
    return res.status(400).json({ error: 'Category name is required.' });
  }
  const formattedCards = Array.isArray(cards) ? cards : [];
  if (!process.env.DATABASE_URL) {
    const idx = mockServices.findIndex(s => String(s.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    mockServices[idx] = {
      ...mockServices[idx],
      category,
      icon: icon || 'Camera',
      tagline: tagline || '',
      cards: formattedCards
    };
    return res.json(mockServices[idx]);
  }
  try {
    const result = await pool.query(
      'UPDATE services SET category=$1, icon=$2, tagline=$3, cards=$4 WHERE id=$5 RETURNING *;',
      [category, icon || 'Camera', tagline || '', JSON.stringify(formattedCards), id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update service:', err.message);
    return res.status(500).json({ error: 'Failed to update service.' });
  }
});

// Delete service
app.delete('/api/admin/services/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (!process.env.DATABASE_URL) {
    const idx = mockServices.findIndex(s => String(s.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    mockServices.splice(idx, 1);
    return res.json({ success: true, message: 'Service deleted.' });
  }
  try {
    const result = await pool.query('DELETE FROM services WHERE id=$1 RETURNING id;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    return res.json({ success: true, message: 'Service deleted.' });
  } catch (err) {
    console.error('Failed to delete service:', err.message);
    return res.status(500).json({ error: 'Failed to delete service.' });
  }
});


// ── Admin Projects CRUD Endpoints ────────────────────────────────────────────

// Get all projects for Admin
app.get('/api/admin/projects', authenticateAdmin, async (req, res) => {
  if (!process.env.DATABASE_URL) {
    return res.json(mockProjects);
  }
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id ASC;');
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve projects.' });
  }
});

// Create new project
app.post('/api/admin/projects', authenticateAdmin, async (req, res) => {
  const { title, clientName, location, description, fullDetail, benefit, category, image, showOnHome } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required.' });
  }
  const benefitArray = Array.isArray(benefit) ? benefit : [];
  const isShowOnHome = showOnHome === true || showOnHome === 'true';

  if (!process.env.DATABASE_URL) {
    const newProject = {
      id: `simulated-p-${Date.now()}`,
      title,
      client_name: clientName || '',
      location: location || '',
      description: description || '',
      full_detail: fullDetail || '',
      benefit: benefitArray,
      category: category || '',
      image: image || '',
      show_on_home: isShowOnHome,
      created_at: new Date().toISOString()
    };
    mockProjects.push(newProject);
    return res.status(201).json(newProject);
  }
  try {
    const result = await pool.query(
      'INSERT INTO projects (title, client_name, location, description, full_detail, benefit, category, image, show_on_home) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;',
      [title, clientName || '', location || '', description || '', fullDetail || '', benefitArray, category || '', image || '', isShowOnHome]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create project:', err.message);
    return res.status(500).json({ error: 'Failed to create project.' });
  }
});

// Update project
app.put('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, clientName, location, description, fullDetail, benefit, category, image, showOnHome } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Project title is required.' });
  }
  const benefitArray = Array.isArray(benefit) ? benefit : [];
  const isShowOnHome = showOnHome === true || showOnHome === 'true';

  if (!process.env.DATABASE_URL) {
    const idx = mockProjects.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    mockProjects[idx] = {
      ...mockProjects[idx],
      title,
      client_name: clientName || '',
      location: location || '',
      description: description || '',
      full_detail: fullDetail || '',
      benefit: benefitArray,
      category: category || '',
      image: image || '',
      show_on_home: isShowOnHome
    };
    return res.json(mockProjects[idx]);
  }
  try {
    const result = await pool.query(
      'UPDATE projects SET title=$1, client_name=$2, location=$3, description=$4, full_detail=$5, benefit=$6, category=$7, image=$8, show_on_home=$9 WHERE id=$10 RETURNING *;',
      [title, clientName || '', location || '', description || '', fullDetail || '', benefitArray, category || '', image || '', isShowOnHome, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Failed to update project:', err.message);
    return res.status(500).json({ error: 'Failed to update project.' });
  }
});

// Delete project
app.delete('/api/admin/projects/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  if (!process.env.DATABASE_URL) {
    const idx = mockProjects.findIndex(p => String(p.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    mockProjects.splice(idx, 1);
    return res.json({ success: true, message: 'Project deleted.' });
  }
  try {
    const result = await pool.query('DELETE FROM projects WHERE id=$1 RETURNING id;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    return res.json({ success: true, message: 'Project deleted.' });
  } catch (err) {
    console.error('Failed to delete project:', err.message);
    return res.status(500).json({ error: 'Failed to delete project.' });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 SafeHive backend running on port ${PORT}`);
  await initDb();
});
