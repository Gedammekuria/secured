// api/server.js — Vercel Serverless Function adapter for Express
// Vercel runs this file as a serverless function for all /api/* requests.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const { Pool } = pg;

// ── Database pool ──────────────────────────────────────────────────────────────
const connectionString = process.env.DATABASE_URL;
const isNeon = connectionString && connectionString.includes('neon.tech');

const pool = connectionString
    ? new Pool({
        connectionString,
        ssl: isNeon ? { rejectUnauthorized: false } : false,
    })
    : null;

// ── In-memory mock data (used when DATABASE_URL is not set) ────────────────────
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
        message: 'Please provide a detailed site assessment and proposal.',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
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
        message: 'Looking for a simple burglar alarm system for my villa.',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
];

// ── DB initialisation (runs once per cold start) ───────────────────────────────
let dbInitialised = false;
async function ensureDb() {
    if (dbInitialised || !pool) return;
    try {
        await pool.query(`
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
        message TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await pool.query(`
      ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
    `);
        dbInitialised = true;
    } catch (err) {
        console.error('DB init error:', err.message);
    }
}

// ── Express app ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Auth middleware ────────────────────────────────────────────────────────────
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

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
    if (!pool) {
        return res.json({ status: 'healthy', database: 'simulated (DATABASE_URL not set)' });
    }
    try {
        await pool.query('SELECT 1');
        return res.json({ status: 'healthy', database: 'connected' });
    } catch (err) {
        return res.status(500).json({ status: 'unhealthy', error: err.message });
    }
});

// ── POST /api/inquiries ────────────────────────────────────────────────────────
app.post('/api/inquiries', async (req, res) => {
    await ensureDb();
    const {
        id, source, fullName, initialContact, alternativeContact,
        companyName, location, budget, inquiryType, customInquiry,
        numCameras, footageDuration, cctvOther, alarmPropertyType,
        numSensors, alarmSystemType, message,
    } = req.body;

    if (!source || !fullName || !initialContact) {
        return res.status(400).json({ error: 'source, fullName and initialContact are required.' });
    }
    if (source !== 'quote' && source !== 'contact') {
        return res.status(400).json({ error: '"source" must be "quote" or "contact".' });
    }

    const formattedInquiryType = Array.isArray(inquiryType) ? inquiryType : [];
    const parsedNumCameras = numCameras != null && numCameras !== '' ? parseInt(numCameras, 10) : null;
    const parsedNumSensors = numSensors != null && numSensors !== '' ? parseInt(numSensors, 10) : null;

    // ── Simulation mode ──────────────────────────────────────────────────────────
    if (!pool) {
        if (id) {
            const idx = mockInquiries.findIndex(m => String(m.id) === String(id));
            if (idx !== -1) {
                const e = mockInquiries[idx];
                const gv = (nv, ev) => (nv != null && nv !== '' ? nv : ev);
                mockInquiries[idx] = {
                    ...e,
                    source: gv(source, e.source),
                    full_name: gv(fullName, e.full_name),
                    initial_contact: gv(initialContact, e.initial_contact),
                    alternative_contact: gv(alternativeContact, e.alternative_contact),
                    company_name: gv(companyName, e.company_name),
                    location: gv(location, e.location),
                    budget: gv(budget, e.budget),
                    inquiry_type: formattedInquiryType.length ? formattedInquiryType : e.inquiry_type,
                    custom_inquiry: gv(customInquiry, e.custom_inquiry),
                    num_cameras: parsedNumCameras ?? e.num_cameras,
                    footage_duration: gv(footageDuration, e.footage_duration),
                    cctv_other: gv(cctvOther, e.cctv_other),
                    alarm_property_type: gv(alarmPropertyType, e.alarm_property_type),
                    num_sensors: parsedNumSensors ?? e.num_sensors,
                    alarm_system_type: gv(alarmSystemType, e.alarm_system_type),
                    message: gv(message, e.message),
                };
                return res.status(200).json({ success: true, id, createdAt: e.created_at });
            }
        }
        const mock = {
            id: `simulated-${Date.now()}`, source, full_name: fullName,
            initial_contact: initialContact, alternative_contact: alternativeContact || null,
            company_name: companyName || null, location: location || null, budget: budget || null,
            inquiry_type: formattedInquiryType, custom_inquiry: customInquiry || null,
            num_cameras: parsedNumCameras, footage_duration: footageDuration || null,
            cctv_other: cctvOther || null, alarm_property_type: alarmPropertyType || null,
            num_sensors: parsedNumSensors, alarm_system_type: alarmSystemType || null,
            message: message || null, status: 'pending', created_at: new Date().toISOString(),
        };
        mockInquiries.unshift(mock);
        return res.status(201).json({ success: true, id: mock.id, createdAt: mock.created_at });
    }

    // ── Database update mode ─────────────────────────────────────────────────────
    const numericId = parseInt(id, 10);
    if (id && !isNaN(numericId)) {
        try {
            const existing = await pool.query('SELECT * FROM inquiries WHERE id = $1;', [numericId]);
            if (existing.rows.length > 0) {
                const e = existing.rows[0];
                const gv = (nv, ev) => (nv != null && nv !== '' ? nv : ev);
                const r = await pool.query(
                    `UPDATE inquiries SET source=$1,full_name=$2,initial_contact=$3,alternative_contact=$4,
           company_name=$5,location=$6,budget=$7,inquiry_type=$8,custom_inquiry=$9,
           num_cameras=$10,footage_duration=$11,cctv_other=$12,alarm_property_type=$13,
           num_sensors=$14,alarm_system_type=$15,message=$16 WHERE id=$17 RETURNING id,created_at;`,
                    [
                        gv(source, e.source), gv(fullName, e.full_name), gv(initialContact, e.initial_contact),
                        gv(alternativeContact, e.alternative_contact), gv(companyName, e.company_name),
                        gv(location, e.location), gv(budget, e.budget),
                        formattedInquiryType.length ? formattedInquiryType : e.inquiry_type,
                        gv(customInquiry, e.custom_inquiry), parsedNumCameras ?? e.num_cameras,
                        gv(footageDuration, e.footage_duration), gv(cctvOther, e.cctv_other),
                        gv(alarmPropertyType, e.alarm_property_type), parsedNumSensors ?? e.num_sensors,
                        gv(alarmSystemType, e.alarm_system_type), gv(message, e.message), numericId,
                    ]
                );
                return res.status(200).json({ success: true, id: r.rows[0].id, createdAt: r.rows[0].created_at });
            }
        } catch (err) {
            return res.status(500).json({ error: 'Failed to update inquiry.', details: err.message });
        }
    }

    // ── Database insert mode ─────────────────────────────────────────────────────
    try {
        const r = await pool.query(
            `INSERT INTO inquiries (source,full_name,initial_contact,alternative_contact,company_name,
       location,budget,inquiry_type,custom_inquiry,num_cameras,footage_duration,cctv_other,
       alarm_property_type,num_sensors,alarm_system_type,message,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING id,created_at;`,
            [
                source, fullName, initialContact, alternativeContact || null, companyName || null,
                location || null, budget || null, formattedInquiryType, customInquiry || null,
                parsedNumCameras, footageDuration || null, cctvOther || null,
                alarmPropertyType || null, parsedNumSensors, alarmSystemType || null, message || null, 'pending',
            ]
        );
        return res.status(201).json({ success: true, id: r.rows[0].id, createdAt: r.rows[0].created_at });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to save inquiry.', details: err.message });
    }
});

// ── POST /api/admin/login ──────────────────────────────────────────────────────
app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@safehive.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'safehiveadmin';
    const secretToken = process.env.ADMIN_TOKEN || 'safehive_secret_token_2026';

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }
    if (email.toLowerCase() === expectedEmail.toLowerCase() && password === expectedPassword) {
        return res.json({ success: true, token: secretToken });
    }
    return res.status(401).json({ error: 'Invalid email or password.' });
});

// ── GET /api/admin/inquiries ───────────────────────────────────────────────────
app.get('/api/admin/inquiries', authenticateAdmin, async (req, res) => {
    await ensureDb();
    if (!pool) return res.json(mockInquiries);
    try {
        const r = await pool.query('SELECT * FROM inquiries ORDER BY created_at DESC;');
        return res.json(r.rows);
    } catch (err) {
        return res.status(500).json({ error: 'Failed to retrieve inquiries.', details: err.message });
    }
});

// ── DELETE /api/admin/inquiries/:id ───────────────────────────────────────────
app.delete('/api/admin/inquiries/:id', authenticateAdmin, async (req, res) => {
    await ensureDb();
    const { id } = req.params;
    if (!pool) {
        const exists = mockInquiries.some(m => String(m.id) === String(id));
        if (!exists) return res.status(404).json({ error: 'Inquiry not found.' });
        mockInquiries = mockInquiries.filter(m => String(m.id) !== String(id));
        return res.json({ success: true, message: 'Inquiry deleted (Simulated).' });
    }
    try {
        const r = await pool.query('DELETE FROM inquiries WHERE id = $1 RETURNING id;', [id]);
        if (r.rowCount === 0) return res.status(404).json({ error: 'Inquiry not found.' });
        return res.json({ success: true, message: 'Inquiry deleted.' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to delete inquiry.', details: err.message });
    }
});

// ── PUT /api/admin/inquiries/:id/status ───────────────────────────────────────
app.put('/api/admin/inquiries/:id/status', authenticateAdmin, async (req, res) => {
    await ensureDb();
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'accepted', 'progress', 'finished'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid or missing status value.' });
    }
    if (!pool) {
        const idx = mockInquiries.findIndex(m => String(m.id) === String(id));
        if (idx === -1) return res.status(404).json({ error: 'Inquiry not found.' });
        mockInquiries[idx].status = status;
        return res.json({ success: true, message: 'Status updated (Simulated).' });
    }
    try {
        const numericId = parseInt(id, 10);
        if (isNaN(numericId)) return res.status(400).json({ error: 'Invalid ID format.' });
        const r = await pool.query(
            'UPDATE inquiries SET status = $1 WHERE id = $2 RETURNING id;',
            [status, numericId]
        );
        if (r.rowCount === 0) return res.status(404).json({ error: 'Inquiry not found.' });
        return res.json({ success: true, message: 'Status updated.' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to update status.', details: err.message });
    }
});

// ── Vercel serverless export ───────────────────────────────────────────────────
export default app;
