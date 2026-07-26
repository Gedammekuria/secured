import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log("Connected to DB, updating image paths...");
  
  // 1. Update Projects
  const { rows: projects } = await pool.query('SELECT * FROM projects;');
  for (const p of projects) {
    if (p.image) {
      // e.g. "/assets/service/amibara project.JPG" -> "/assets/service/amibara-project.jpg"
      // or "/assets/service/maryod_bakery.webp" -> "/assets/service/amstel_frozen_foods.webp" (if it was that)
      let newImage = p.image;
      
      // Fix Maryod Bakery old image if it exists in DB
      if (newImage.includes('maryod_bakery.webp') || newImage.includes('maryod_bakery.jpg')) {
        newImage = newImage.replace(/maryod_bakery\.(webp|jpg)/, 'amstel_frozen_foods.webp');
      }

      // Replace spaces with hyphens
      let filename = newImage.split('/').pop();
      let pathPrefix = newImage.substring(0, newImage.lastIndexOf('/') + 1);
      
      if (filename.includes(' ')) {
        filename = filename.replace(/ /g, '-');
      }
      
      // Ensure lower case extension if it was .JPG
      if (filename.endsWith('.JPG')) {
        filename = filename.replace('.JPG', '.jpg');
      }

      newImage = pathPrefix + filename;

      if (newImage !== p.image) {
        console.log(`Project ${p.id} image: ${p.image} -> ${newImage}`);
        await pool.query('UPDATE projects SET image = $1 WHERE id = $2', [newImage, p.id]);
      }
    }
  }

  // 2. Update Services
  const { rows: services } = await pool.query('SELECT * FROM services;');
  for (const s of services) {
    if (s.cards) {
      let cardsStr = typeof s.cards === 'string' ? s.cards : JSON.stringify(s.cards);
      let updatedCardsStr = cardsStr;
      
      // Fix spaces in image filenames within the JSON
      // We can just use a regex to find all "image": "/assets/service/something with spaces.webp"
      const imageRegex = /"image":\s*"([^"]+)"/g;
      
      updatedCardsStr = updatedCardsStr.replace(imageRegex, (match, imagePath) => {
        let filename = imagePath.split('/').pop();
        let pathPrefix = imagePath.substring(0, imagePath.lastIndexOf('/') + 1);
        if (filename.includes(' ')) {
          filename = filename.replace(/ /g, '-');
        }
        if (filename.endsWith('.JPG')) {
          filename = filename.replace('.JPG', '.jpg');
        }
        return `"image":"${pathPrefix + filename}"`;
      });

      if (updatedCardsStr !== cardsStr) {
        console.log(`Service ${s.id} cards updated.`);
        await pool.query('UPDATE services SET cards = $1 WHERE id = $2', [updatedCardsStr, s.id]);
      }
    }
  }

  console.log("Database image paths successfully updated!");
  pool.end();
}

run().catch(err => {
  console.error("Error:", err);
  pool.end();
});
