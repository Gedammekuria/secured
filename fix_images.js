import pool from './server/db.js';

// Maps old/wrong DB paths → correct actual file paths
const projectImageFixes = [
    { id_title: 'Amibara Properties CCTV Installation', newImage: '/assets/service/amibara-project.webp' },
    { id_title: 'Jotun CCTV Installation', newImage: '/assets/service/jotun-cctv.webp' },
    { id_title: 'Oasis Hotel Apartment CCTV Installation', newImage: '/assets/service/oasishotel.webp' },
    { id_title: 'Sunrise Real Estate CCTV Installation', newImage: '/assets/service/Sunrise-project.webp' },
    { id_title: 'Amstel Frozen Foods CCTV Installation ', newImage: '/assets/service/amstel_frozen_foods.webp' },
    { id_title: 'Jotun Fire Alarm System', newImage: '/assets/service/fire-alarm-control-system.webp' },
    { id_title: 'Ethiopian Insurance Corporation Fire Alarm', newImage: '/assets/service/fire-alarm-installation.webp' },
    { id_title: 'Ethiopian Insurance Corporation Door Lock', newImage: '/assets/service/smart-doorlock.webp' },
];

// Maps old service card image paths → correct actual file paths
const serviceCardImageFixes = {
    '/assets/service/outdoor camera 1.webp': '/assets/service/outdoor-camera-1.webp',
    '/assets/service/indoor camera 1.webp': '/assets/service/indoor-camera-1.webp',
    '/assets/service/mobile view.webp': '/assets/service/mobile-view.webp',
    '/assets/service/ajax detector.webp': '/assets/service/ajax-detector.webp',
    '/assets/service/ajax control.webp': '/assets/service/ajax-control.webp',
    '/assets/service/fire_alarm_system.webp': '/assets/service/fire_alarm_system.webp', // already correct
    '/assets/service/burglar.webp': '/assets/service/burglar.webp',           // already correct
    '/assets/service/ring_doorbell.webp': '/assets/service/ring-doorbell.webp',
    '/assets/service/biometric_door_lock.webp': '/assets/service/smart-door-lock-installation.webp',
    '/assets/service/smart_glass_door_lock.webp': '/assets/service/smart-glass-doorlock.webp',
};

async function fixImages() {
    try {
        console.log('🔧 Fixing project image paths...');
        for (const fix of projectImageFixes) {
            const result = await pool.query(
                'UPDATE projects SET image = $1 WHERE title = $2 RETURNING id, title',
                [fix.newImage, fix.id_title]
            );
            if (result.rows.length > 0) {
                console.log(`  ✅ Fixed: "${result.rows[0].title}" → ${fix.newImage}`);
            } else {
                // Try trimmed title match for the Amstel one
                const result2 = await pool.query(
                    'UPDATE projects SET image = $1 WHERE TRIM(title) = TRIM($2) RETURNING id, title',
                    [fix.newImage, fix.id_title]
                );
                if (result2.rows.length > 0) {
                    console.log(`  ✅ Fixed (trimmed): "${result2.rows[0].title}" → ${fix.newImage}`);
                } else {
                    console.log(`  ⚠️  No row found for: "${fix.id_title}"`);
                }
            }
        }

        console.log('\n🔧 Fixing service card image paths...');
        const services = await pool.query('SELECT id, category, cards FROM services');
        for (const svc of services.rows) {
            const cards = Array.isArray(svc.cards) ? svc.cards : JSON.parse(svc.cards);
            let changed = false;
            const fixedCards = cards.map(card => {
                const newImg = serviceCardImageFixes[card.image];
                if (newImg && newImg !== card.image) {
                    console.log(`  ✅ ${svc.category} / "${card.title}": ${card.image} → ${newImg}`);
                    changed = true;
                    return { ...card, image: newImg };
                }
                return card;
            });

            if (changed) {
                await pool.query('UPDATE services SET cards = $1 WHERE id = $2', [JSON.stringify(fixedCards), svc.id]);
            }
        }

        console.log('\n📊 Verification — current DB paths:');
        const projects = await pool.query('SELECT title, image FROM projects ORDER BY id');
        for (const p of projects.rows) {
            console.log(`  [project] ${p.title.trim()} → ${p.image}`);
        }
        const svcs = await pool.query('SELECT category, cards FROM services ORDER BY id');
        for (const s of svcs.rows) {
            const cards = Array.isArray(s.cards) ? s.cards : JSON.parse(s.cards);
            for (const c of cards) {
                console.log(`  [service] ${s.category} / ${c.title} → ${c.image}`);
            }
        }

        console.log('\n🎉 All image paths fixed!');
    } catch (e) {
        console.error('❌ Error:', e.message);
        console.error(e);
    }
    process.exit(0);
}

fixImages();
