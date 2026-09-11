const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Simple JSON database file
const dbFile = path.join(__dirname, 'db.json');
if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, JSON.stringify([]));
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

// API: Upload entry
app.post(
  '/api/upload',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'audio', maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const { name, frame, caption } = req.body;
      const photoFile = req.files['photo'] ? req.files['photo'][0] : null;
      const audioFile = req.files['audio'] ? req.files['audio'][0] : null;

      if (!name || !photoFile) {
        return res.status(400).json({ error: 'Name and photo are required.' });
      }

      const newEntry = {
        id: Date.now().toString(),
        name,
        frame: frame || 'default',
        caption: caption || '',
        photoUrl: `/uploads/${photoFile.filename}`,
        audioUrl: audioFile ? `/uploads/${audioFile.filename}` : null,
        timestamp: new Date().toISOString(),
      };

      // Read current db
      const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      // Prepend to show newest first
      dbData.unshift(newEntry);
      // Write back
      fs.writeFileSync(dbFile, JSON.stringify(dbData, null, 2));

      res.status(201).json({ message: 'Upload successful', entry: newEntry });
    } catch (error) {
      console.error('Upload Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// API: Get Feed
app.get('/api/feed', (req, res) => {
  try {
    const dbData = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
    res.json(dbData);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
