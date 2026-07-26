import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_DIR = path.join(__dirname, 'public', 'assets', 'service');

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Extensions to convert
const CONVERT_EXTS = ['.jpg', '.jpeg', '.png'];

async function convertImages() {
  const files = fs.readdirSync(SERVICE_DIR);
  const converted = []; // { oldName, newName }

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!CONVERT_EXTS.includes(ext)) {
      console.log(`⏭️  Skipping (already webp or not image): ${file}`);
      continue;
    }

    const baseName = path.basename(file, path.extname(file));
    const newName = baseName + '.webp';
    const srcPath = path.join(SERVICE_DIR, file);
    const destPath = path.join(SERVICE_DIR, newName);

    if (fs.existsSync(destPath)) {
      console.log(`⚠️  Already exists as webp, deleting old: ${file}`);
      fs.unlinkSync(srcPath);
      converted.push({ oldName: file, newName });
      continue;
    }

    try {
      await sharp(srcPath)
        .webp({ quality: 82 })
        .toFile(destPath);

      const oldSize = fs.statSync(srcPath).size;
      const newSize = fs.statSync(destPath).size;
      const saving = (((oldSize - newSize) / oldSize) * 100).toFixed(1);
      console.log(`✅ ${file} → ${newName} (${(oldSize/1024).toFixed(0)}KB → ${(newSize/1024).toFixed(0)}KB, saved ${saving}%)`);

      // Delete original
      fs.unlinkSync(srcPath);
      converted.push({ oldName: file, newName });
    } catch (err) {
      console.error(`❌ Failed to convert ${file}:`, err.message);
    }
  }

  return converted;
}

async function updateDatabase(converted) {
  if (converted.length === 0) {
    console.log('\nNo conversions to update in DB.');
    return;
  }

  console.log('\n📦 Updating database image paths...');

  // Build old->new path mapping
  const pathMap = {};
  for (const { oldName, newName } of converted) {
    pathMap[`/assets/service/${oldName}`] = `/assets/service/${newName}`;
    // Also handle case-insensitive matches
    pathMap[`/assets/service/${oldName.toLowerCase()}`] = `/assets/service/${newName}`;
  }

  // Update projects
  const { rows: projects } = await pool.query('SELECT id, image FROM projects;');
  for (const p of projects) {
    const newPath = pathMap[p.image] || pathMap[(p.image || '').toLowerCase()];
    if (newPath && newPath !== p.image) {
      await pool.query('UPDATE projects SET image = $1 WHERE id = $2', [newPath, p.id]);
      console.log(`  Project ${p.id}: ${p.image} → ${newPath}`);
    }
  }

  // Update services cards
  const { rows: services } = await pool.query('SELECT id, cards FROM services;');
  for (const s of services) {
    let cardsStr = typeof s.cards === 'string' ? s.cards : JSON.stringify(s.cards);
    let updated = false;

    for (const { oldName, newName } of converted) {
      if (cardsStr.includes(oldName)) {
        cardsStr = cardsStr.split(oldName).join(newName);
        updated = true;
      }
    }

    if (updated) {
      await pool.query('UPDATE services SET cards = $1 WHERE id = $2', [cardsStr, s.id]);
      console.log(`  Service ${s.id}: cards updated`);
    }
  }

  console.log('✅ Database updated!');
}

async function main() {
  console.log('🔄 Starting image conversion to WebP...\n');
  const converted = await convertImages();
  console.log(`\n📊 Converted ${converted.length} image(s).`);

  if (converted.length > 0) {
    await updateDatabase(converted);
  }

  console.log('\n🎉 Done! All images are now WebP.');
  pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  pool.end();
  process.exit(1);
});
