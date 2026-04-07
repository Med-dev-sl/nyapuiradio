const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_with_a_better_secret';
const RESEND_API_KEY = 're_JKaD4oTP_CirqsR3emGvvdgJ37dTyUJtb';
const resend = new Resend(RESEND_API_KEY);

// Audit Logging Utility
const logAction = async (userId, action, details = '', targetType = null, targetId = null) => {
  try {
    await db.run(
      'INSERT INTO audit_logs (user_id, action, details, target_type, target_id) VALUES (?, ?, ?, ?, ?)',
      [userId, action, details, targetType, targetId]
    );
  } catch (err) {
    console.error('Audit Log Error:', err);
  }
};

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function sendUserCreationEmail(email, username, password) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Nyapui Radio <noreply@connectsierraleone.com>',
      to: [email],
      subject: 'Your Nyapui Radio Account Has Been Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Nyapui Radio!</h2>
          <p>Your account has been successfully created. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Username:</strong> ${username}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>
          <p>You can access the Superadmin Dashboard by clicking the link below:</p>
          <a href="https://connectsierraleone.com/superadmin" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Access Superadmin Dashboard</a>
          <p style="color: #666; font-size: 14px;">Please change your password after your first login for security purposes.</p>
          <p style="color: #666; font-size: 14px;">If you have any questions, please contact support.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log('Email sent successfully:', data);
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    req.userId = payload.id; // Alias for ease of use in logAction
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Debug endpoint to check all users in database
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await db.all('SELECT id, username, role, full_name FROM users');
    res.json({ count: users.length, users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    console.log(`[LOGIN] Attempt with username: "${username}"`);
    const user = await db.get('SELECT id, username, password_hash, role, permissions, full_name, user_email, bio, profile_picture FROM users WHERE username = ?;', [username]);
    if (!user) {
      console.log(`[LOGIN] User "${username}" not found in database`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`[LOGIN] User "${username}" found. Verifying password...`);
    const providedHash = hashPassword(password);
    if (providedHash !== user.password_hash) {
      console.log(`[LOGIN] Password mismatch for user "${username}"`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    console.log(`[LOGIN] User "${username}" authenticated successfully`);

    const token = jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role
    }, JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({ token, user: { 
      id: user.id, 
      username: user.username, 
      role: user.role,
      permissions: user.permissions ? JSON.parse(user.permissions) : {},
      full_name: user.full_name,
      user_email: user.user_email,
      bio: user.bio,
      profile_picture: user.profile_picture
    } });
  } catch (err) {
    console.error('POST /api/auth/login error', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await db.get('SELECT id, username, role, permissions, full_name, user_email, bio, profile_picture FROM users WHERE id = ?;', [req.user.id]);
    res.json({ user: { ...user, permissions: user.permissions ? JSON.parse(user.permissions) : {} } });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

app.put('/api/auth/me', authenticate, async (req, res) => {
  const { full_name, user_email, bio, profile_picture } = req.body;
  
  try {
    await db.run(
      'UPDATE users SET full_name = ?, user_email = ?, bio = ?, profile_picture = ? WHERE id = ?',
      [full_name, user_email, bio, profile_picture, req.user.id]
    );
    
    await logAction(req.user.id, 'UPDATE_PROFILE', `Updated personal profile details`, 'user', req.user.id);
    
    const updatedUser = await db.get('SELECT id, username, role, full_name, user_email, bio, profile_picture FROM users WHERE id = ?;', [req.user.id]);
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    console.error('PUT /api/auth/me error', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.get('/api/users', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT id, username, role, permissions, full_name, user_email, bio, profile_picture FROM users ORDER BY username ASC;');
    const users = rows.map(u => ({
      ...u,
      permissions: u.permissions ? JSON.parse(u.permissions) : {}
    }));
    res.json(users);
  } catch (err) {
    console.error('GET /api/users error', err);
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.post('/api/users', authenticate, async (req, res) => {
  const { username, password, role, permissions, full_name, user_email, bio, profile_picture } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  if (username.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters long' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if username already exists
    const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
    }

    const passwordHash = hashPassword(password);
    const permissionsJson = JSON.stringify(permissions || {});
    
    const result = await db.run(
      'INSERT INTO users (username, password_hash, role, permissions, full_name, user_email, bio, profile_picture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [username, passwordHash, role, permissionsJson, full_name, user_email, bio, profile_picture]
    );

    await logAction(req.userId, 'CREATE_USER', `Created user: ${username} (${role})`, 'user', result.lastID);

    // Send email notification if email is provided
    if (user_email) {
      const emailSent = await sendUserCreationEmail(user_email, username, password);
      if (!emailSent) {
        console.warn(`Failed to send email to ${user_email} for user ${username}`);
      }
    }

    res.status(201).json({ id: result.lastID, username, role });
  } catch (err) {
    console.error('POST /api/users error', err);
    res.status(500).json({ error: 'Error creating user' });
  }
});

app.put('/api/users/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { username, password, role, permissions, full_name, user_email, bio, profile_picture } = req.body;

  if (!username || !role) {
    return res.status(400).json({ error: 'Username and role are required' });
  }

  try {
    // Get current user to check if username is being changed
    const currentUser = await db.get('SELECT username FROM users WHERE id = ?', [id]);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if new username conflicts with existing users (and it's different from current)
    if (username !== currentUser.username) {
      const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [username]);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists. Please choose a different username.' });
      }
    }

    let sql = 'UPDATE users SET username = ?, role = ?, permissions = ?, full_name = ?, user_email = ?, bio = ?, profile_picture = ?';
    let params = [username, role, JSON.stringify(permissions || {}), full_name, user_email, bio, profile_picture];

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      sql += ', password_hash = ?';
      params.push(hashPassword(password));
    }

    sql += ' WHERE id = ?';
    params.push(id);

    const result = await db.run(sql, params);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

    await logAction(req.userId, 'UPDATE_USER', `Updated user: ${username}`, 'user', id);
    res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('PUT /api/users error', err);
    res.status(500).json({ error: 'Error updating user' });
  }
});

app.delete('/api/users/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent deleting self
    if (parseInt(id) === req.userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'User not found' });

    await logAction(req.userId, 'DELETE_USER', `Deleted user ID: ${id}`, 'user', id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

app.get('/api/assets', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM assets ORDER BY asset_tag DESC;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/assets error', err);
    res.status(500).json({ error: 'Error reading assets' });
  }
});

app.post('/api/assets', authenticate, async (req, res) => {
  const { name, category, status, purchase_date, value, location, notes, image } = req.body;
  
  if (!name || !category || !status) {
    return res.status(400).json({ error: 'Name, category, and status are required' });
  }

  try {
    // Generate NYARADIOXXXXX ID
    const lastAsset = await db.get('SELECT id FROM assets ORDER BY id DESC LIMIT 1;');
    const nextId = (lastAsset?.id || 0) + 1;
    const assetTag = `NYARADIO${String(nextId).padStart(5, '0')}`;

    const result = await db.run(
      'INSERT INTO assets (asset_tag, name, category, status, purchase_date, value, location, notes, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [assetTag, name, category, status, purchase_date, value, location, notes, image]
    );
    await logAction(req.userId, 'CREATE_ASSET', `Registered asset: ${name} (${assetTag})`, 'asset', result.lastID);
    res.status(201).json({ id: result.lastID, asset_tag: assetTag, name, category, status });
  } catch (err) {
    console.error('POST /api/assets error', err);
    res.status(500).json({ error: 'Error creating asset' });
  }
});

app.put('/api/assets/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, category, status, purchase_date, value, location, notes, image, last_maintenance } = req.body;

  try {
    const result = await db.run(
      `UPDATE assets SET 
        name = ?, category = ?, status = ?, purchase_date = ?, 
        value = ?, location = ?, notes = ?, image = ?, last_maintenance = ?
       WHERE id = ?`,
      [name, category, status, purchase_date, value, location, notes, image, last_maintenance, id]
    );

    if (result.changes === 0) return res.status(404).json({ error: 'Asset not found' });
    await logAction(req.userId, 'UPDATE_ASSET', `Updated asset: ${name}`, 'asset', id);
    res.json({ message: 'Asset updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating asset' });
  }
});

app.delete('/api/assets/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM assets WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Asset not found' });
    await logAction(req.userId, 'DELETE_ASSET', `Deleted asset ID: ${id}`, 'asset', id);
    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting asset' });
  }
});

app.get('/api/media/folders', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM folders ORDER BY name ASC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching folders' });
  }
});

app.post('/api/media/folders', authenticate, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Folder name is required' });
  try {
    const result = await db.run('INSERT INTO folders (name) VALUES (?)', [name]);
    await logAction(req.userId, 'CREATE_FOLDER', `Created media folder: ${name}`, 'folder', result.lastID);
    res.status(201).json({ id: result.lastID, name });
  } catch (err) {
    res.status(500).json({ error: 'Error creating folder' });
  }
});

app.delete('/api/media/folders/:id', authenticate, async (req, res) => {
  try {
    await db.run('DELETE FROM folders WHERE id = ?', [req.params.id]);
    await logAction(req.userId, 'DELETE_FOLDER', `Deleted folder ID: ${req.params.id}`, 'folder', req.params.id);
    res.json({ message: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting folder' });
  }
});

app.get('/api/media/files', authenticate, async (req, res) => {
  const { folderId } = req.query;
  try {
    let sql = 'SELECT * FROM media';
    let params = [];
    
    if (folderId && folderId !== 'null') {
      sql += ' WHERE folder_id = ?';
      params.push(folderId);
    } else {
      // Root level: only show files that are NOT in any folder
      sql += ' WHERE folder_id IS NULL';
    }
    
    sql += ' ORDER BY created_at DESC';
    const rows = await db.all(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching files' });
  }
});

app.post('/api/media/upload', authenticate, async (req, res) => {
  const { name, type, size, url, folder_id, upload_date } = req.body;
  if (!name || !type || !url) {
    return res.status(400).json({ error: 'Name, type, and file content are required' });
  }
  try {
    const finalDate = upload_date || new Date().toISOString().split('T')[0];
    const result = await db.run(
      'INSERT INTO media (name, type, size, url, folder_id, upload_date) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type, size, url, folder_id || null, finalDate]
    );
    await logAction(req.userId, 'UPLOAD_MEDIA', `Uploaded ${type}: ${name}`, 'media', result.lastID);
    res.status(201).json({ id: result.lastID, name, type });
  } catch (err) {
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.delete('/api/media/files/:id', authenticate, async (req, res) => {
  try {
    await db.run('DELETE FROM media WHERE id = ?', [req.params.id]);
    await logAction(req.userId, 'DELETE_MEDIA', `Deleted media ID: ${req.params.id}`, 'media', req.params.id);
    res.json({ message: 'File deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting file' });
  }
});

app.get('/api/media/files/:id', authenticate, async (req, res) => {
  try {
    const file = await db.get('SELECT * FROM media WHERE id = ?', [req.params.id]);
    res.json(file);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching file' });
  }
});

app.get('/api/media/stats', authenticate, async (req, res) => {
  try {
    const stats = await db.all(`
      SELECT type, COUNT(*) as count, SUM(size) as total_size 
      FROM media 
      GROUP BY type
    `);
    const formatted = {
      image: stats.find(s => s.type === 'image') || { count: 0, total_size: 0 },
      video: stats.find(s => s.type === 'video') || { count: 0, total_size: 0 },
      audio: stats.find(s => s.type === 'audio') || { count: 0, total_size: 0 },
      document: stats.find(s => s.type === 'document') || { count: 0, total_size: 0 }
    };
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching media stats' });
  }
});

app.get('/api/audit-logs', authenticate, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT a.*, u.full_name, u.username 
      FROM audit_logs a 
      LEFT JOIN users u ON a.user_id = u.id 
      ORDER BY a.created_at DESC 
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching audit logs' });
  }
});

app.get('/api/assets/stats', authenticate, async (req, res) => {
  try {
    const total = await db.get('SELECT COUNT(*) as count FROM assets;');
    const operational = await db.get('SELECT COUNT(*) as count FROM assets WHERE status = "Operational";');
    const maintenance = await db.get('SELECT COUNT(*) as count FROM assets WHERE status = "Maintenance";');
    const faulty = await db.get('SELECT COUNT(*) as count FROM assets WHERE status = "Faulty";');
    const totalValue = await db.get('SELECT SUM(value) as total FROM assets;');

    res.json({
      total: total.count,
      operational: operational.count,
      maintenance: maintenance.count,
      faulty: faulty.count,
      totalValue: totalValue.total || 0
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

app.get('/api/spots', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT id, name, frequency FROM stations;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/spots error', err);
    res.status(500).json({ error: 'Error reading stations' });
  }
});

app.post('/api/spots', authenticate, async (req, res) => {
  const { name, frequency } = req.body;
  if (!name || !frequency) {
    return res.status(400).json({ error: 'name and frequency are required' });
  }

  try {
    const result = await db.run('INSERT INTO stations (name, frequency) VALUES (?, ?)', [name, frequency]);
    res.status(201).json({ id: result.lastID, name, frequency });
  } catch (err) {
    console.error('POST /api/spots error', err);
    res.status(500).json({ error: 'Error creating station' });
  }
});

app.get('/api/donors', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT id, name, email, amount, date FROM donors ORDER BY date DESC;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/donors error', err);
    res.status(500).json({ error: 'Error reading donors' });
  }
});

app.post('/api/donors', authenticate, async (req, res) => {
  const { name, email, amount } = req.body;
  if (!name || !amount) {
    return res.status(400).json({ error: 'name and amount are required' });
  }

  const date = new Date().toISOString();

  try {
    const result = await db.run('INSERT INTO donors (name, email, amount, date) VALUES (?, ?, ?, ?)', [name, email, amount, date]);
    await logAction(req.userId, 'RECORD_DONATION', `Donation recorded from ${name} (SLe ${amount})`, 'donation', result.lastID);
    res.status(201).json({ id: result.lastID, name, email, amount, date });
  } catch (err) {
    console.error('POST /api/donors error', err);
    res.status(500).json({ error: 'Error creating donor' });
  }
});

app.put('/api/donors/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, email, amount } = req.body;
  try {
    const result = await db.run(
      'UPDATE donors SET name = ?, email = ?, amount = ? WHERE id = ?',
      [name, email, amount, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Donor not found' });
    await logAction(req.userId, 'UPDATE_DONOR', `Updated donor: ${name} (SLe ${amount})`, 'donor', id);
    res.json({ message: 'Donor updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating donor' });
  }
});

app.delete('/api/donors/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM donors WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Donor not found' });
    await logAction(req.userId, 'DELETE_DONOR', `Removed donor ID: ${id}`, 'donor', id);
    res.json({ message: 'Donor deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting donor' });
  }
});

app.get('/api/tasks', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT t.*, u.username as creator_name FROM tasks t LEFT JOIN users u ON t.creator_id = u.id ORDER BY t.due_date ASC, t.created_at DESC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

app.post('/api/tasks', authenticate, async (req, res) => {
  const { title, description, category, priority, status, due_date } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'Title and category are required' });
  try {
    const result = await db.run(
      'INSERT INTO tasks (creator_id, title, description, category, priority, status, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, title, description, category, priority, status || 'Pending', due_date]
    );
    await logAction(req.userId, 'CREATE_TASK', `Created task: ${title}`, 'task', result.lastID);
    res.status(201).json({ id: result.lastID, title });
  } catch (err) {
    res.status(500).json({ error: 'Error creating task' });
  }
});

app.put('/api/tasks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, category, priority, status, due_date } = req.body;
  try {
    const result = await db.run(
      'UPDATE tasks SET title = ?, description = ?, category = ?, priority = ?, status = ?, due_date = ? WHERE id = ?',
      [title, description, category, priority, status, due_date, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
    await logAction(req.userId, 'UPDATE_TASK', `Updated task: ${title}`, 'task', id);
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating task' });
  }
});

app.patch('/api/tasks/:id/status', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });
  try {
    const result = await db.run('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
    await logAction(req.userId, 'TOGGLE_TASK_STATUS', `Updated task ID: ${id} to ${status}`, 'task', id);
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating status' });
  }
});

app.delete('/api/tasks/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM tasks WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
    await logAction(req.userId, 'DELETE_TASK', `Deleted task ID: ${id}`, 'task', id);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task' });
  }
});

app.get('/api/partners', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM partners ORDER BY name ASC;');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching partners' });
  }
});

app.post('/api/partners', authenticate, async (req, res) => {
  const { name, logo, type, contact_person, email, phone, status, agreement_date, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Partner name is required' });
  try {
    const result = await db.run(
      'INSERT INTO partners (name, logo, type, contact_person, email, phone, status, agreement_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, logo, type, contact_person, email, phone, status || 'Active', agreement_date, notes]
    );
    await logAction(req.userId, 'CREATE_PARTNER', `Registered new partner: ${name}`, 'partner', result.lastID);
    res.status(201).json({ id: result.lastID, name });
  } catch (err) {
    res.status(500).json({ error: 'Error creating partner' });
  }
});

app.put('/api/partners/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, logo, type, contact_person, email, phone, status, agreement_date, notes } = req.body;
  try {
    const result = await db.run(
      'UPDATE partners SET name = ?, logo = ?, type = ?, contact_person = ?, email = ?, phone = ?, status = ?, agreement_date = ?, notes = ? WHERE id = ?',
      [name, logo, type, contact_person, email, phone, status, agreement_date, notes, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Partner not found' });
    await logAction(req.userId, 'UPDATE_PARTNER', `Updated partner details: ${name}`, 'partner', id);
    res.json({ message: 'Partner updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating partner' });
  }
});

app.delete('/api/partners/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM partners WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Partner not found' });
    await logAction(req.userId, 'DELETE_PARTNER', `Removed partner record ID: ${id}`, 'partner', id);
    res.json({ message: 'Partner deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting partner' });
  }
});

app.get('/api/analytics/summary', authenticate, async (req, res) => {
  try {
    // Donor Stats
    const donorStats = await db.get('SELECT COUNT(*) as count, SUM(amount) as total, AVG(amount) as avg FROM donors;');
    
    // Partner Stats
    const partnerStats = await db.all('SELECT type, COUNT(*) as count FROM partners GROUP BY type;');
    
    // Asset Stats (reuse logic but send together)
    const totalAssets = await db.get('SELECT COUNT(*) as count, SUM(value) as totalValue FROM assets;');
    const operationalAssets = await db.get('SELECT COUNT(*) as count FROM assets WHERE status = "Operational";');
    
    // Task Stats
    const totalTasks = await db.get('SELECT COUNT(*) as count FROM tasks;');
    const completedTasks = await db.get('SELECT COUNT(*) as count FROM tasks WHERE status = "Completed";');
    
    // Media Stats
    const mediaCount = await db.get('SELECT COUNT(*) as count FROM media;');

    res.json({
      donors: {
        totalCount: donorStats.count || 0,
        totalAmount: donorStats.total || 0,
        averageAmount: donorStats.avg || 0
      },
      partners: {
        total: partnerStats.reduce((acc, curr) => acc + curr.count, 0),
        breakdown: partnerStats
      },
      assets: {
        totalCount: totalAssets.count || 0,
        totalValue: totalAssets.totalValue || 0,
        operationalCount: operationalAssets.count || 0
      },
      tasks: {
        total: totalTasks.count || 0,
        completed: completedTasks.count || 0,
        completionRate: totalTasks.count > 0 ? (completedTasks.count / totalTasks.count * 100).toFixed(1) : 0
      },
      media: {
        totalFiles: mediaCount.count || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error generating analytics summary' });
  }
});

app.get('/api/social/posts', authenticate, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT s.*, u.username, u.full_name 
      FROM social_posts s 
      LEFT JOIN users u ON s.user_id = u.id 
      ORDER BY s.created_at DESC LIMIT 50
    `);
    res.json(rows.map(r => ({ ...r, platforms: JSON.parse(r.platforms || '[]') })));
  } catch (err) {
    res.status(500).json({ error: 'Error fetching social history' });
  }
});

app.post('/api/social/post', authenticate, async (req, res) => {
  const { content, image, platforms } = req.body;
  if (!content || !platforms || !platforms.length) {
    return res.status(400).json({ error: 'Content and at least one platform required' });
  }

  try {
    // Simulated Social Dispatcher
    console.log(`[SOCIAL NEXUS] Dispatching content to: ${platforms.join(', ')}`);
    
    const result = await db.run(
      'INSERT INTO social_posts (user_id, content, image, platforms, status) VALUES (?, ?, ?, ?, ?)',
      [req.userId, content, image || null, JSON.stringify(platforms), 'Posted']
    );

    await logAction(
      req.userId, 
      'SOCIAL_BROADCAST', 
      `Nexus Broadcast: ${content.substring(0, 30)}... on [${platforms.join(', ')}]`, 
      'social_nexus', 
      result.lastID
    );

    res.status(201).json({ 
      id: result.lastID, 
      message: `Content synchronized across ${platforms.length} platforms.` 
    });
  } catch (err) {
    console.error('Social Nexus Error:', err);
    res.status(500).json({ error: 'Social synchronization failed' });
  }
});

// ─── PUBLIC PROGRAMS ROUTES ──────────────────────────────────────────────────
app.get('/api/public/programs', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM programs ORDER BY category ASC, start_time ASC;');
    console.log('[API] Public Programs request. Found programs:', rows.length);
    const programs = rows.map(r => ({
      ...r,
      days: typeof r.days === 'string' ? JSON.parse(r.days || '[]') : r.days
    }));
    res.json(programs);
  } catch (err) {
    console.error('GET /api/public/programs error', err);
    res.status(500).json({ error: 'Error fetching programs' });
  }
});

// ─── PROGRAMS ROUTES ──────────────────────────────────────────────────────────
app.get('/api/programs', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM programs ORDER BY category ASC, start_time ASC;');
    const programs = rows.map(r => ({
      ...r,
      days: typeof r.days === 'string' ? JSON.parse(r.days || '[]') : r.days
    }));
    res.json(programs);
  } catch (err) {
    console.error('GET /api/programs error', err);
    res.status(500).json({ error: 'Error fetching programs' });
  }
});

app.get('/api/programs/:id', authenticate, async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM programs WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Program not found' });
    res.json({ ...row, days: typeof row.days === 'string' ? JSON.parse(row.days || '[]') : row.days });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching program' });
  }
});

app.post('/api/programs', authenticate, async (req, res) => {
  const { title, category, description, host, days, start_time, end_time, status, image, notes } = req.body;
  if (!title || !category || !days || !start_time || !end_time) {
    return res.status(400).json({ error: 'Title, category, days, start time and end time are required' });
  }
  const daysJson = JSON.stringify(Array.isArray(days) ? days : [days]);
  try {
    const result = await db.run(
      'INSERT INTO programs (title, category, description, host, days, start_time, end_time, status, image, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, description, host, daysJson, start_time, end_time, status || 'Active', image || null, notes]
    );
    await logAction(req.userId, 'CREATE_PROGRAM', `Created program: ${title} (${category})`, 'program', result.lastID);
    res.status(201).json({ id: result.lastID, title, category });
  } catch (err) {
    console.error('POST /api/programs error', err);
    res.status(500).json({ error: 'Error creating program' });
  }
});

app.put('/api/programs/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, category, description, host, days, start_time, end_time, status, image, notes } = req.body;
  if (!title || !category || !days || !start_time || !end_time) {
    return res.status(400).json({ error: 'Title, category, days, start time and end time are required' });
  }
  const daysJson = JSON.stringify(Array.isArray(days) ? days : [days]);
  try {
    const result = await db.run(
      'UPDATE programs SET title = ?, category = ?, description = ?, host = ?, days = ?, start_time = ?, end_time = ?, status = ?, image = ?, notes = ? WHERE id = ?',
      [title, category, description, host, daysJson, start_time, end_time, status, image || null, notes, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Program not found' });
    await logAction(req.userId, 'UPDATE_PROGRAM', `Updated program: ${title}`, 'program', id);
    res.json({ message: 'Program updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating program' });
  }
});

app.delete('/api/programs/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM programs WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Program not found' });
    await logAction(req.userId, 'DELETE_PROGRAM', `Deleted program ID: ${id}`, 'program', id);
    res.json({ message: 'Program deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting program' });
  }
});

// ─── NEWS ROUTES ───────────────────────────────────────────────────────────
app.get('/api/news', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM news ORDER BY created_at DESC;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/news error', err);
    res.status(500).json({ error: 'Error fetching news' });
  }
});

app.get('/api/news/:id', authenticate, async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM news WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'News item not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching news item' });
  }
});

app.post('/api/news', authenticate, async (req, res) => {
  const { title, category, headline, details, caption, photo, thumbnail, status } = req.body;
  if (!title || !category || !headline) {
    return res.status(400).json({ error: 'Title, category and headline are required' });
  }
  try {
    const result = await db.run(
      'INSERT INTO news (title, category, headline, details, caption, photo, thumbnail, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, category, headline, details || '', caption || '', photo || '', thumbnail || '', status || 'Draft']
    );
    await logAction(req.userId, 'CREATE_NEWS', `Published news: ${title}`, 'news', result.lastID);
    res.status(201).json({ id: result.lastID, title, category, headline, status });
  } catch (err) {
    console.error('POST /api/news error', err);
    res.status(500).json({ error: 'Error creating news item' });
  }
});

app.put('/api/news/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, category, headline, details, caption, photo, thumbnail, status } = req.body;
  if (!title || !category || !headline) {
    return res.status(400).json({ error: 'Title, category and headline are required' });
  }
  try {
    const result = await db.run(
      'UPDATE news SET title = ?, category = ?, headline = ?, details = ?, caption = ?, photo = ?, thumbnail = ?, status = ? WHERE id = ?',
      [title, category, headline, details || '', caption || '', photo || '', thumbnail || '', status || 'Draft', id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'News item not found' });
    await logAction(req.userId, 'UPDATE_NEWS', `Updated news: ${title}`, 'news', id);
    res.json({ message: 'News updated successfully' });
  } catch (err) {
    console.error('PUT /api/news error', err);
    res.status(500).json({ error: 'Error updating news item' });
  }
});

app.delete('/api/news/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM news WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'News item not found' });
    await logAction(req.userId, 'DELETE_NEWS', `Deleted news item ID: ${id}`, 'news', id);
    res.json({ message: 'News item removed successfully' });
  } catch (err) {
    console.error('DELETE /api/news error', err);
    res.status(500).json({ error: 'Error deleting news item' });
  }
});

// ─── PODCASTS ROUTES ─────────────────────────────────────────────────────────
app.get('/api/podcasts', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM podcasts ORDER BY created_at DESC;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/podcasts error', err);
    res.status(500).json({ error: 'Error fetching podcasts' });
  }
});

app.get('/api/podcasts/:id', authenticate, async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM podcasts WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Podcast not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching podcast' });
  }
});

app.post('/api/podcasts', authenticate, async (req, res) => {
  const { title, description, thumbnail, video_url, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Podcast title is required' });
  try {
    const result = await db.run('INSERT INTO podcasts (title, description, thumbnail, video_url, status) VALUES (?, ?, ?, ?, ?)', [title, description || '', thumbnail || '', video_url || '', status || 'Draft']);
    await logAction(req.userId, 'CREATE_PODCAST', `Created podcast: ${title}`, 'podcast', result.lastID);
    res.status(201).json({ id: result.lastID, title });
  } catch (err) {
    console.error('POST /api/podcasts error', err);
    res.status(500).json({ error: 'Error creating podcast' });
  }
});

app.put('/api/podcasts/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, thumbnail, video_url, status } = req.body;
  if (!title) return res.status(400).json({ error: 'Podcast title is required' });
  try {
    const result = await db.run('UPDATE podcasts SET title = ?, description = ?, thumbnail = ?, video_url = ?, status = ? WHERE id = ?', [title, description || '', thumbnail || '', video_url || '', status || 'Draft', id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Podcast not found' });
    await logAction(req.userId, 'UPDATE_PODCAST', `Updated podcast: ${title}`, 'podcast', id);
    res.json({ message: 'Podcast updated successfully' });
  } catch (err) {
    console.error('PUT /api/podcasts error', err);
    res.status(500).json({ error: 'Error updating podcast' });
  }
});

app.delete('/api/podcasts/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM podcasts WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Podcast not found' });
    await logAction(req.userId, 'DELETE_PODCAST', `Deleted podcast ID: ${id}`, 'podcast', id);
    res.json({ message: 'Podcast deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/podcasts error', err);
    res.status(500).json({ error: 'Error deleting podcast' });
  }
});

// ─── PROGRAM VIDEOS ROUTES ───────────────────────────────────────────────────
app.get('/api/program-videos', authenticate, async (req, res) => {
  try {
    const rows = await db.all(`SELECT pv.*, p.title AS program_title FROM program_videos pv LEFT JOIN programs p ON pv.program_id = p.id ORDER BY pv.created_at DESC;`);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/program-videos error', err);
    res.status(500).json({ error: 'Error fetching program videos' });
  }
});

app.get('/api/program-videos/:id', authenticate, async (req, res) => {
  try {
    const row = await db.get(`SELECT pv.*, p.title AS program_title FROM program_videos pv LEFT JOIN programs p ON pv.program_id = p.id WHERE pv.id = ?`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Program video not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching program video' });
  }
});

app.post('/api/program-videos', authenticate, async (req, res) => {
  const { program_id, title, description, thumbnail, video_url, status } = req.body;
  if (!program_id || !title) return res.status(400).json({ error: 'Program and title are required' });
  try {
    const result = await db.run('INSERT INTO program_videos (program_id, title, description, thumbnail, video_url, status) VALUES (?, ?, ?, ?, ?, ?)', [program_id, title, description || '', thumbnail || '', video_url || '', status || 'Draft']);
    await logAction(req.userId, 'CREATE_PROGRAM_VIDEO', `Created program video: ${title}`, 'program_video', result.lastID);
    res.status(201).json({ id: result.lastID, title });
  } catch (err) {
    console.error('POST /api/program-videos error', err);
    res.status(500).json({ error: 'Error creating program video' });
  }
});

app.put('/api/program-videos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { program_id, title, description, thumbnail, video_url, status } = req.body;
  if (!program_id || !title) return res.status(400).json({ error: 'Program and title are required' });
  try {
    const result = await db.run('UPDATE program_videos SET program_id = ?, title = ?, description = ?, thumbnail = ?, video_url = ?, status = ? WHERE id = ?', [program_id, title, description || '', thumbnail || '', video_url || '', status || 'Draft', id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Program video not found' });
    await logAction(req.userId, 'UPDATE_PROGRAM_VIDEO', `Updated program video: ${title}`, 'program_video', id);
    res.json({ message: 'Program video updated successfully' });
  } catch (err) {
    console.error('PUT /api/program-videos error', err);
    res.status(500).json({ error: 'Error updating program video' });
  }
});

app.delete('/api/program-videos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM program_videos WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Program video not found' });
    await logAction(req.userId, 'DELETE_PROGRAM_VIDEO', `Deleted program video ID: ${id}`, 'program_video', id);
    res.json({ message: 'Program video deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/program-videos error', err);
    res.status(500).json({ error: 'Error deleting program video' });
  }
});

// ─── SERVICES ROUTES ──────────────────────────────────────────────────────────
app.get('/api/services', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM services ORDER BY name ASC;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/services error', err);
    res.status(500).json({ error: 'Error fetching services' });
  }
});

app.get('/api/services/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Service not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching service' });
  }
});

app.post('/api/services', authenticate, async (req, res) => {
  const { name, description, image, terms_conditions, status } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Service name is required' });
  }
  try {
    const result = await db.run(
      'INSERT INTO services (name, description, image, terms_conditions, status) VALUES (?, ?, ?, ?, ?)',
      [name, description, image, terms_conditions, status || 'Active']
    );
    await logAction(req.userId, 'CREATE_SERVICE', `Created service: ${name}`, 'service', result.lastID);
    res.status(201).json({ id: result.lastID, name, description, image, terms_conditions, status });
  } catch (err) {
    console.error('POST /api/services error', err);
    res.status(500).json({ error: 'Error creating service' });
  }
});

app.put('/api/services/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, description, image, terms_conditions, status } = req.body;
  try {
    const result = await db.run(
      'UPDATE services SET name = ?, description = ?, image = ?, terms_conditions = ?, status = ? WHERE id = ?',
      [name, description, image, terms_conditions, status, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Service not found' });
    await logAction(req.userId, 'UPDATE_SERVICE', `Updated service: ${name}`, 'service', id);
    res.json({ message: 'Service updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating service' });
  }
});

app.delete('/api/services/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM services WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Service not found' });
    await logAction(req.userId, 'DELETE_SERVICE', `Deleted service ID: ${id}`, 'service', id);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting service' });
  }
});

// ─── SERVICE BOOKINGS ROUTES ─────────────────────────────────────────────────
app.get('/api/service-bookings', authenticate, async (req, res) => {
  try {
    const rows = await db.all(`
      SELECT sb.*, s.name as service_name 
      FROM service_bookings sb 
      LEFT JOIN services s ON sb.service_id = s.id 
      ORDER BY sb.created_at DESC;
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/service-bookings error', err);
    res.status(500).json({ error: 'Error fetching service bookings' });
  }
});

app.post('/api/service-bookings', async (req, res) => {
  const { service_id, customer_name, customer_email, customer_phone, booking_date, details } = req.body;
  if (!service_id || !customer_name || !customer_email) {
    return res.status(400).json({ error: 'Service ID, customer name, and email are required' });
  }
  try {
    const result = await db.run(
      'INSERT INTO service_bookings (service_id, customer_name, customer_email, customer_phone, booking_date, details) VALUES (?, ?, ?, ?, ?, ?)',
      [service_id, customer_name, customer_email, customer_phone, booking_date, details]
    );
    res.status(201).json({ id: result.lastID, message: 'Booking submitted successfully' });
  } catch (err) {
    console.error('POST /api/service-bookings error', err);
    res.status(500).json({ error: 'Error creating booking' });
  }
});

app.put('/api/service-bookings/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await db.run(
      'UPDATE service_bookings SET status = ? WHERE id = ?',
      [status, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json({ message: 'Booking status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating booking' });
  }
});

// ─── STAFF ROUTES ───────────────────────────────────────────────────────────
app.get('/api/staff', authenticate, async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM staff ORDER BY full_name ASC;');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/staff error', err);
    res.status(500).json({ error: 'Error fetching staff' });
  }
});

app.get('/api/staff/:id', authenticate, async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM staff WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Staff not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching staff member' });
  }
});

app.post('/api/staff', authenticate, async (req, res) => {
  const { full_name, role, email, phone, image, bio, facebook, instagram, tiktok, status, joined_date } = req.body;
  if (!full_name || !role || !email) {
    return res.status(400).json({ error: 'Full name, role, and email are required' });
  }
  try {
    const result = await db.run(
      'INSERT INTO staff (full_name, role, email, phone, image, bio, facebook, instagram, tiktok, status, joined_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [full_name, role, email, phone, image, bio, facebook, instagram, tiktok, status || 'Active', joined_date || new Date().toISOString().split('T')[0]]
    );
    await logAction(req.userId, 'CREATE_STAFF', `Created staff member: ${full_name}`, 'staff', result.lastID);
    res.status(201).json({ id: result.lastID, full_name, role, email, phone, image, bio, facebook, instagram, tiktok, status, joined_date });
  } catch (err) {
    console.error('POST /api/staff error', err);
    res.status(500).json({ error: 'Error creating staff member' });
  }
});

app.put('/api/staff/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { full_name, role, email, phone, image, bio, facebook, instagram, tiktok, status, joined_date } = req.body;
  if (!full_name || !role || !email) {
    return res.status(400).json({ error: 'Full name, role, and email are required' });
  }
  try {
    const result = await db.run(
      'UPDATE staff SET full_name = ?, role = ?, email = ?, phone = ?, image = ?, bio = ?, facebook = ?, instagram = ?, tiktok = ?, status = ?, joined_date = ? WHERE id = ?',
      [full_name, role, email, phone, image, bio, facebook, instagram, tiktok, status || 'Active', joined_date, id]
    );
    if (result.changes === 0) return res.status(404).json({ error: 'Staff not found' });
    await logAction(req.userId, 'UPDATE_STAFF', `Updated staff member: ${full_name}`, 'staff', id);
    res.json({ message: 'Staff updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error updating staff member' });
  }
});

app.delete('/api/staff/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.run('DELETE FROM staff WHERE id = ?', [id]);
    if (result.changes === 0) return res.status(404).json({ error: 'Staff not found' });
    await logAction(req.userId, 'DELETE_STAFF', `Deleted staff member ID: ${id}`, 'staff', id);
    res.json({ message: 'Staff removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting staff member' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
