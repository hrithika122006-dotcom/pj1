const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const db = require('./database');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Ensure uploads directory exists
fs.ensureDirSync('uploads');

// --- Routes ---

// Register
app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', 
    [username, email, password], 
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    res.json({ success: true, user: { username: row.username, email: row.email } });
  });
});

// Schedule Memory
app.post('/api/schedule', upload.single('image'), (req, res) => {
  const { sender, receiver, date } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!image || !sender || !receiver || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate receiver exists
  db.get('SELECT * FROM users WHERE username = ?', [receiver], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Receiver not found' });

      const memoryId = uuidv4();
      db.run('INSERT INTO memories (id, sender, receiver, date, image, shown) VALUES (?, ?, ?, ?, ?, 0)',
        [memoryId, sender, receiver, date, image],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
      );
  });
});

// Check for Popup Memories (only if date <= today and shown=0)
app.get('/api/memories/check/:username', (req, res) => {
  const { username } = req.params;
  const today = new Date().toISOString().split('T')[0];

  db.all('SELECT * FROM memories WHERE receiver = ? AND date <= ? AND shown = 0', 
    [username, today], 
    (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (rows.length > 0) {
            const ids = rows.map(r => r.id);
            const placeholders = ids.map(() => '?').join(',');
            
            db.run(`UPDATE memories SET shown = 1 WHERE id IN (${placeholders})`, ids, (updateErr) => {
                if (updateErr) console.error('Error updating shown status:', updateErr.message);
            });
        }
        res.json(rows);
    }
  );
});

// Get Received Memories History (All past received memories)
app.get('/api/memories/history/:username', (req, res) => {
    const { username } = req.params;
    const today = new Date().toISOString().split('T')[0];

    db.all('SELECT * FROM memories WHERE receiver = ? AND date <= ? ORDER BY date DESC', 
      [username, today], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
});

// Get Sent Memories History (All scheduled by user)
app.get('/api/memories/sent/:username', (req, res) => {
    const { username } = req.params;

    db.all('SELECT * FROM memories WHERE sender = ? ORDER BY date DESC', 
      [username], 
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      }
    );
});


// Helper routes for cleaner URLs
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });
app.get('/dashboard', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'dashboard.html')); });
app.get('/history', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'history.html')); });
app.get('/sent', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'sent.html')); });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
