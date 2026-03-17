const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { Pool } = require('pg');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const isPostgres = !!process.env.DATABASE_URL;
let dbInstance;
let pgPool;

async function getDb() {
  if (dbInstance) return dbInstance;
  
  if (isPostgres) {
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } 
    });
    
    // Test connection
    await pgPool.query('SELECT NOW()');
    
    dbInstance = { isPostgres: true };
    await initializeSchema();
    return dbInstance;
  } else {
    const dbPath = path.join(__dirname, 'database.sqlite');
    dbInstance = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    await initializeSchema();
    return dbInstance;
  }
}

async function initializeSchema() {
  const runSql = async (sql) => {
    if (isPostgres) {
      await pgPool.query(sql);
    } else {
      await dbInstance.exec(sql);
    }
  };

  const idType = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
  const textType = 'TEXT';
  const realType = isPostgres ? 'DOUBLE PRECISION' : 'REAL';
  const timestampType = isPostgres ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' : 'DATETIME DEFAULT CURRENT_TIMESTAMP';

  // Tables Initialization
  await runSql(`CREATE TABLE IF NOT EXISTS assets (id ${idType}, asset_tag ${textType} UNIQUE NOT NULL, name ${textType} NOT NULL, category ${textType} NOT NULL, status ${textType} NOT NULL, purchase_date ${textType}, value ${realType}, last_maintenance ${textType}, location ${textType}, notes ${textType}, image ${textType});`);
  await runSql(`CREATE TABLE IF NOT EXISTS stations (id ${idType}, name ${textType} NOT NULL, frequency ${textType} NOT NULL);`);
  await runSql(`CREATE TABLE IF NOT EXISTS donors (id ${idType}, name ${textType} NOT NULL, email ${textType}, amount ${realType} NOT NULL, date ${textType} NOT NULL);`);
  await runSql(`CREATE TABLE IF NOT EXISTS folders (id ${idType}, name ${textType} NOT NULL, parent_id INTEGER, created_at ${timestampType});`);
  await runSql(`CREATE TABLE IF NOT EXISTS media (id ${idType}, name ${textType} NOT NULL, type ${textType} NOT NULL, size INTEGER, url ${textType} NOT NULL, folder_id INTEGER, upload_date ${textType}, created_at ${timestampType} ${isPostgres ? ', CONSTRAINT fk_folder FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE' : ', FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE'});`);
  await runSql(`CREATE TABLE IF NOT EXISTS users (id ${idType}, username ${textType} UNIQUE NOT NULL, password_hash ${textType} NOT NULL, role ${textType} NOT NULL, full_name ${textType}, user_email ${textType}, bio ${textType}, profile_picture ${textType});`);
  await runSql(`CREATE TABLE IF NOT EXISTS audit_logs (id ${idType}, user_id INTEGER, action ${textType} NOT NULL, details ${textType}, target_type ${textType}, target_id INTEGER, created_at ${timestampType} ${isPostgres ? ', CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)' : ', FOREIGN KEY (user_id) REFERENCES users(id)'});`);
  await runSql(`CREATE TABLE IF NOT EXISTS tasks (id ${idType}, creator_id INTEGER, title ${textType} NOT NULL, description ${textType}, category ${textType} NOT NULL, priority ${textType} DEFAULT 'Medium', status ${textType} DEFAULT 'Pending', due_date ${textType}, created_at ${timestampType} ${isPostgres ? ', CONSTRAINT fk_creator FOREIGN KEY (creator_id) REFERENCES users(id)' : ', FOREIGN KEY (creator_id) REFERENCES users(id)'});`);
  await runSql(`CREATE TABLE IF NOT EXISTS partners (id ${idType}, name ${textType} NOT NULL, logo ${textType}, type ${textType}, contact_person ${textType}, email ${textType}, phone ${textType}, status ${textType} DEFAULT 'Active', agreement_date ${textType}, notes ${textType}, created_at ${timestampType});`);
  await runSql(`CREATE TABLE IF NOT EXISTS social_posts (id ${idType}, user_id INTEGER, content ${textType} NOT NULL, image ${textType}, platforms ${textType}, status ${textType} DEFAULT 'Posted', created_at ${timestampType} ${isPostgres ? ', CONSTRAINT fk_social_user FOREIGN KEY (user_id) REFERENCES users(id)' : ', FOREIGN KEY (user_id) REFERENCES users(id)'});`);

  // Migration logic
  const tryAddCol = async (table, col, type) => {
    try {
      if (isPostgres) {
        const check = await pgPool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='${table}' AND column_name='${col}'`);
        if (check.rowCount === 0) await pgPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      } else {
        await dbInstance.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
      }
    } catch (e) {}
  };

  await tryAddCol('assets', 'image', 'TEXT');
  await tryAddCol('users', 'full_name', 'TEXT');
  await tryAddCol('users', 'user_email', 'TEXT');
  await tryAddCol('users', 'bio', 'TEXT');
  await tryAddCol('users', 'profile_picture', 'TEXT');
  await tryAddCol('media', 'upload_date', 'TEXT');

  const defaultUser = process.env.SUPERUSER_NAME || 'admin';
  const defaultPassword = process.env.SUPERUSER_PASSWORD || 'Nyapui@123';
  const passwordHash = hashPassword(defaultPassword);

  if (isPostgres) {
    await pgPool.query('INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) ON CONFLICT (username) DO NOTHING', [defaultUser, passwordHash, 'superuser']);
  } else {
    await dbInstance.run('INSERT OR IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)', [defaultUser, passwordHash, 'superuser']);
  }
}

// Helper to translate SQL
function translateSql(sql) {
  if (!isPostgres) return sql;
  let count = 0;
  return sql.replace(/\?/g, () => `$${++count}`);
}

const dbPromise = getDb();

module.exports = {
  all: async (sql, params = []) => {
    await dbPromise;
    if (isPostgres) {
      const res = await pgPool.query(translateSql(sql), params);
      return res.rows;
    } else {
      return dbInstance.all(sql, params);
    }
  },
  get: async (sql, params = []) => {
    await dbPromise;
    if (isPostgres) {
      const res = await pgPool.query(translateSql(sql), params);
      return res.rows[0];
    } else {
      return dbInstance.get(sql, params);
    }
  },
  run: async (sql, params = []) => {
    await dbPromise;
    if (isPostgres) {
      let finalSql = translateSql(sql);
      const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
      if (isInsert && !finalSql.toUpperCase().includes('RETURNING')) {
        finalSql += ' RETURNING id';
      }
      const res = await pgPool.query(finalSql, params);
      return { 
        lastID: isInsert && res.rows[0] ? res.rows[0].id : null, 
        changes: res.rowCount 
      };
    } else {
      return dbInstance.run(sql, params);
    }
  },
};
