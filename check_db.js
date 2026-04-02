const db = require('./backend/db');

async function checkPrograms() {
  try {
    const programs = await db.all('SELECT * FROM programs');
    console.log('Total programs in DB:', programs.length);
    programs.forEach(p => {
      console.log(`- ${p.title} (${p.status})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkPrograms();
