const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const dbPath = path.join(__dirname, 'database.sqlite');

async function createDatabase() {
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Assets Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_tag TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL,
      purchase_date TEXT,
      value REAL,
      last_maintenance TEXT,
      location TEXT,
      notes TEXT,
      image TEXT
    );
  `);

  // Ensure columns exist for existing assets table
  try { await db.exec('ALTER TABLE assets ADD COLUMN image TEXT;'); } catch (e) {}

  // Stations Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      frequency TEXT NOT NULL
    );
  `);

  // Donors Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      amount REAL NOT NULL,
      date TEXT NOT NULL
    );
  `);

  // Folders Table (Media Library)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Media Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- image, video, audio, document
      size INTEGER,
      url TEXT NOT NULL, -- base64 or path
      folder_id INTEGER,
      upload_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );
  `);

  // Audit Logs Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      target_type TEXT,
      target_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Tasks Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL, -- Daily, Weekly
      priority TEXT DEFAULT 'Medium', -- Low, Medium, High
      status TEXT DEFAULT 'Pending', -- Pending, In Progress, Completed
      due_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (creator_id) REFERENCES users(id)
    );
  `);

  // Partners Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      logo TEXT, -- base64
      type TEXT, -- NGO, Corporate, Government, Media
      contact_person TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'Active', -- Active, Inactive, Pending
      agreement_date TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Social Posts Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS social_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      content TEXT NOT NULL,
      image TEXT, -- base64
      platforms TEXT, -- JSON string of platforms
      status TEXT DEFAULT 'Posted',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      full_name TEXT,
      user_email TEXT,
      bio TEXT,
      profile_picture TEXT
    );
  `);

  // Ensure columns exist for existing databases
  try { await db.exec('ALTER TABLE users ADD COLUMN full_name TEXT;'); } catch (e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN user_email TEXT;'); } catch (e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN bio TEXT;'); } catch (e) {}
  try { await db.exec('ALTER TABLE users ADD COLUMN profile_picture TEXT;'); } catch (e) {}
  try { await db.exec('ALTER TABLE media ADD COLUMN upload_date TEXT;'); } catch (e) {}

  const defaultUser = process.env.SUPERUSER_NAME || 'admin';
  const defaultPassword = process.env.SUPERUSER_PASSWORD || 'Nyapui@123';
  const passwordHash = hashPassword(defaultPassword);

  await db.run(
    'INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)',
    [defaultUser, passwordHash, 'superuser']
  );

  return db;
}

let dbInstance;

const dbPromise = (async () => {
  dbInstance = await createDatabase();
  return dbInstance;
})();

module.exports = {
  all: async (sql, params = []) => {
    const db = await dbPromise;
    return db.all(sql, params);
  },
  get: async (sql, params = []) => {
    const db = await dbPromise;
    return db.get(sql, params);
  },
  run: async (sql, params = []) => {
    const db = await dbPromise;
    return db.run(sql, params);
  },
};
