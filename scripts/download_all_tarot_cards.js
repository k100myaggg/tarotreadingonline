const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://raw.githubusercontent.com/mixvlad/TarotCards/main/tarot/rider-waite/720px/';
const OUT_DIR = path.join(process.cwd(), 'public', 'cards', 'rws');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// Map card IDs to filename in mixvlad/TarotCards
const cards = require('../src/data/tarot/cards.json');

const MAJOR_FILENAMES = [
  '00_Fool.jpg',
  '01_Magician.jpg',
  '02_High_Priestess.jpg',
  '03_Empress.jpg',
  '04_Emperor.jpg',
  '05_Hierophant.jpg',
  '06_Lovers.jpg',
  '07_Chariot.jpg',
  '08_Strength.jpg',
  '09_Hermit.jpg',
  '10_Wheel_of_Fortune.jpg',
  '11_Justice.jpg',
  '12_Hanged_Man.jpg',
  '13_Death.jpg',
  '14_Temperance.jpg',
  '15_Devil.jpg',
  '16_Tower.jpg',
  '17_Star.jpg',
  '18_Moon.jpg',
  '19_Sun.jpg',
  '20_Judgement.jpg',
  '21_World.jpg'
];

function getFilenameForCard(card) {
  if (card.arcana === 'major') {
    return MAJOR_FILENAMES[card.number];
  }
  
  const suitPrefix = {
    cups: 'Cups',
    pentacles: 'Pents',
    swords: 'Swords',
    wands: 'Wands'
  }[card.suit];

  const numStr = String(card.number).padStart(2, '0');
  return `${suitPrefix}${numStr}.jpg`;
}

function downloadFile(filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(OUT_DIR, filename);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve({ filename, skipped: true });
    }

    const file = fs.createWriteStream(dest);
    https.get(`${BASE_URL}${filename}`, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode} for ${filename}`));
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve({ filename, success: true });
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log(`Starting download of 78 Rider-Waite-Smith tarot cards...`);
  const uniqueFilenames = new Set();
  for (const card of cards) {
    const fn = getFilenameForCard(card);
    if (fn) uniqueFilenames.add(fn);
  }

  // Also download Cover.jpg for fallback
  uniqueFilenames.add('Cover.jpg');

  console.log(`Total files to fetch: ${uniqueFilenames.size}`);
  
  const filesArray = Array.from(uniqueFilenames);
  // Download in batches of 6
  let count = 0;
  for (let i = 0; i < filesArray.length; i += 6) {
    const batch = filesArray.slice(i, i + 6);
    await Promise.all(batch.map(fn => downloadFile(fn)));
    count += batch.length;
    process.stdout.write(`Downloaded ${count}/${filesArray.length} cards...\r`);
  }

  console.log(`\nSuccessfully downloaded all tarot cards to public/cards/rws!`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
