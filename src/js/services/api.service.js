import { API_URL } from '../config.js';

export async function getToken() {
  const res = await fetch(`${API_URL}/api/token`);
  const data = await res.json();
  return data.token;
}

export async function getTopTracks() {
  const res = await fetch(`${API_URL}/api/top-tracks`);
  const data = await res.json();
  return data.tracks;
}

export async function getTrack(token, trackUrl) {
  const response = await fetch(trackUrl, {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!response) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getAlbums() {
  const res = await fetch(`${API_URL}/api/albums`);
  const data = await res.json();
  return data.albums;
}

export async function getAlbumTracks(albumId) {
  const res = await fetch(`${API_URL}/api/album/${albumId}/tracks`);
  const data = await res.json();
  return data.tracks;
}
