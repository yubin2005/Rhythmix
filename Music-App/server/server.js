const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios')
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, '../'))); // serve front-end if needed

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// Upload route
app.post('/upload', upload.array('songs'), (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const files = req.files.map(f => {
    const buf = Buffer.from(f.originalname, 'binary');
    const interim = buf.toString('utf8');
    let realName;
    try {
      realName = decodeURIComponent(interim);
    } catch {
      realName = interim;
    }
    return {
      displayName: realName,
      url: `${base}/uploads/${encodeURIComponent(f.filename)}`,
      filename: f.filename
    };
  });
  res.json({ files });
});

// Delete route
app.delete('/upload', (req, res) => {
  const { filename } = req.body;
  if (!filename) {
    return res.status(400).json({ error: "No Filename Provided" });
  }
  const filePath = path.join(UPLOAD_DIR, filename);
  fs.unlink(filePath, err => {
    if (err) {
      console.error(err);
      return res.status(err.code === 'ENOENT' ? 404 : 500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});


app.get('/api/trending', async (req, res) => {
  try {
    // Get top 10 songs from Deezer
    const resp = await axios.get('https://api.deezer.com/chart/0/tracks?limit=10');
    const trending = resp.data.data.map(track => ({
      title:  track.title,
      artist: track.artist.name,
      preview: track.preview,
      cover:   track.album.cover_medium
    }));
    res.json({ trending });
  } catch (err) {
    console.error('Deezer Trending Error:', err);
    res.status(500).json({ error: 'Failed to load trending songs' });
  }
});

// Gemini AI Playlist route
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/playlist', async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood || typeof mood !== 'string') {
      return res.status(400).json({ error: 'Invalid mood' });
    }

    const prompt = `
    You are a music recommendation assistant.
    Based on the user's mood "${mood}",
    recommend 5 songs. It is best to be the most popular one in Spotify and Youtube-Music.
    Return a JSON array like this:
    [
      { "title": "Song Title", "artist": "Artist Name" },
      ...
    ]
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const match = text.match(/\[\s*{[\s\S]*}\s*\]/);
    const rawList = match ? JSON.parse(match[0]) : [];

    const playlist = await Promise.all(rawList.map(async song => {
      try {
        const q = encodeURIComponent(`track:"${song.title}" artist:"${song.artist}"`);
        const { data } = await axios.get(`https://api.deezer.com/search?q=${q}&limit=1`);
        if (data.data.length) {
          const d = data.data[0];
          return {
            title:   song.title,
            artist:  song.artist,
            preview: d.preview,             // 30s preview URL
            cover:   d.album.cover_medium   // cover image URL
          };
        }
      } catch (e) {
        console.warn(`Deezer lookup failed for ${song.title} — ${song.artist}`, e);
      }
      return { ...song }; // fallback to basic info
    }));

    // Return enriched playlist
    res.json({ playlist });

  } catch (err) {
    console.error('Gemini / Deezer error:', err);
    res.status(500).json({ error: 'Failed to generate playlist' });
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
