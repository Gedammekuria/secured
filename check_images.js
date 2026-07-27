import pool from './server/db.js';

async function checkImages() {
    try {
        console.log('=== PROJECT IMAGES IN DATABASE ===');
        const projects = await pool.query('SELECT id, title, image FROM projects ORDER BY id');
        for (const p of projects.rows) {
            console.log(`[${p.id}] ${p.title}`);
            console.log(`    DB path: ${p.image}`);
        }

        console.log('\n=== SERVICE CARD IMAGES IN DATABASE ===');
        const services = await pool.query('SELECT id, category, cards FROM services ORDER BY id');
        for (const s of services.rows) {
            console.log(`\nService: ${s.category}`);
            const cards = Array.isArray(s.cards) ? s.cards : JSON.parse(s.cards);
            for (const c of cards) {
                console.log(`  Card: ${c.title} => ${c.image}`);
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit(0);
}
checkImages();
