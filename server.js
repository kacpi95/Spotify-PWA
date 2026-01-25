require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const __dirnameResolved = path.resolve();

app.use(express.static(path.join(__dirnameResolved, 'src')));

app.use(cors());
app.use(express.json());

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const tokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', globalLimiter);

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error('Missing Spotify .env. Set CLIENT_ID and CLIENT_SECRET');
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

async function getSpotifyToken() {
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64',
  );

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + authHeader,
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  const data = await response.json();
  return data.access_token;
}

app.get('/api/token', tokenLimiter, async (req, res) => {
  try {
    const token = await getSpotifyToken();
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get token' });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      'https://api.spotify.com/v1/browse/categories?locale=en_US',
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );

    const data = await response.json();
    res.json({ categories: data.categories.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

app.get('/api/top-tracks', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=top&type=track&limit=15`,
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + token,
        },
      },
    );

    const data = await response.json();
    res.json({ tracks: data.tracks.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

app.get('/api/albums', async (req, res) => {
  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      'https://api.spotify.com/v1/browse/new-releases?limit=20',
      {
        headers: { Authorization: 'Bearer ' + token },
      },
    );
    const data = await response.json();
    res.json({ albums: data.albums.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

app.get('/api/album/:id/tracks', async (req, res) => {
  const albumId = req.params.id;
  try {
    const token = await getSpotifyToken();

    const response = await fetch(
      `https://api.spotify.com/v1/albums/${albumId}/tracks`,
      {
        headers: { Authorization: 'Bearer ' + token },
      },
    );
    const data = await response.json();
    res.json({ tracks: data.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch album tracks' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running at localhost http://localhost:${PORT}`);
});
