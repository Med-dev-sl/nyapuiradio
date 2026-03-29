const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkAndSeed() {
  const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  try {
    const programs = await db.all('SELECT * FROM programs');
    console.log(`Found ${programs.length} programs in database.`);

    if (programs.length === 0) {
      console.log('Seeding dummy programs...');
      const dummyPrograms = [
        ['Breakfast Club', 'Music & Entertainment', 'Start your day with the best vibes and local news.', 'DJ Jojo', '["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]', '07:00', '10:00', 'Active'],
        ['The Women\'s Voice', 'Women\'s Programs', 'In-depth discussions on policy, gender equity and community growth.', 'Sarah Kamara', '["Tuesday", "Thursday"]', '14:00', '16:00', 'Active'],
        ['Sports Weekly', 'Sports', 'All the latest from the Sierra Leone sports scene and beyond.', 'Tommy Cole', '["Saturday"]', '18:00', '20:00', 'Active'],
        ['Midnight Jazz', 'Music & Entertainment', 'Unwind with smooth classics and deep community stories.', 'Jazz Master', '["Daily"]', '22:00', '00:00', 'Active']
      ];

      for (const p of dummyPrograms) {
        await db.run(
          'INSERT INTO programs (title, category, description, host, days, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          p
        );
      }
      console.log('Seeded 4 programs.');
    } else {
        // Ensure some are Active if they exist
        const activeCount = await db.get('SELECT COUNT(*) as count FROM programs WHERE status = "Active"');
        console.log(`Currently there are ${activeCount.count} Active programs.`);
        if (activeCount.count === 0) {
            console.log('Marking existing programs as Active...');
            await db.run('UPDATE programs SET status = "Active"');
        }
    }
  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await db.close();
  }
}

checkAndSeed();
