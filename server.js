require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function getSpotifyToken() {
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
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

app.get('/api/token', async (req, res) => {
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
      }
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
      }
    );

    const data = await response.json();
    res.json({ tracks: data.tracks.items });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tracks' });
  }
});

app.listen(3000, () => {
  console.log('Backend running at localhost 3000');
});
