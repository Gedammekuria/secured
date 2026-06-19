import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js';
import fs from 'fs';

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
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Initialize database table if not exists
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);

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

    console.log('🟢 Database initialized successfully. Table "inquiries" is ready.');
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
    message
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
          message: getValue(message, existingRecord.message)
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
      created_at: new Date().toISOString()
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
            message = $18
          WHERE id = $19
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
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
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
      'pending'
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
    return res.json({ success: true, message: 'Status updated successfully (Simulated).' });
  }

  try {
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid numeric ID format.' });
    }

    const result = await pool.query(
      'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING id;',
      [status, numericId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Inquiry not found in database.' });
    }

    console.log(`📥 Updated inquiry ID ${id} status to ${status} in database.`);
    return res.json({ success: true, message: 'Status updated successfully.' });
  } catch (err) {
    console.error('🔴 Failed to update status in DB:', err.message);
    return res.status(500).json({ error: 'Failed to update status in database.' });
  }
});

// Start Server
app.listen(PORT, async () => {
  console.log(`🚀 SafeHive backend running on port ${PORT}`);
  await initDb();
});
