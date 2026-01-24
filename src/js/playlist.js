import {
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  createPlaylist,
  loadPlaylists,
  debounce,
} from './helpers.js';
import { playTrack } from './services/player.service.js';
import { getTopTracks } from './services/api.service.js';
import { renderPlaylist } from './utils/renderers/playlistRenderers.js';
import { handlePlayListSearch } from './utils/library.js';

let tracks = [];

async function loadData() {
  try {
    tracks = await getTopTracks();
  } catch (err) {
    console.error('Error', err);
  }
}

const playlistImage = document.getElementById('playlistImage');
const playlistName = document.getElementById('playlistName');
const playlistDescription = document.getElementById('playlistDescription');
const playlistTrackCount = document.getElementById('playlistTrackCount');
const playlistTracksContainer = document.getElementById('playlistTracks');
const changeImageBtn = document.getElementById('changeImageBtn');
const imageUpload = document.getElementById('imageUpload');
const deletePlaylistBtn = document.getElementById('deletePlaylistBtn');
const playAllBtn = document.getElementById('playAllBtn');
const playlistSearchInput = document.getElementById('playlistSearchInput');
const playlistSearchResults = document.getElementById('playlistSearchResults');

const urlParams = new URLSearchParams(window.location.search);
const playlistId = urlParams.get('id');

if (!playlistId) {
  alert('Playlist not found!');
  window.location.href = '../index.html';
}

const currentPlaylist = getPlaylistById(playlistId);

if (!currentPlaylist) {
  alert('Playlist not found!');
  window.location.href = '../index.html';
}

renderPlaylist(playlistId);

if (playlistSearchInput && playlistSearchResults) {
  const debounced = debounce((e) => handlePlayListSearch(e.target.value), 300);
  playlistSearchInput.addEventListener('input', debounced);
}

if (playlistName) {
  playlistName.addEventListener('input', () => {
    updatePlaylist(playlistId, { name: playlistName.textContent });
    loadPlaylists();
  });
}

if (playlistDescription) {
  playlistDescription.addEventListener('input', () => {
    updatePlaylist(playlistId, {
      description: playlistDescription.textContent,
    });
  });
}

if (changeImageBtn && imageUpload) {
  changeImageBtn.addEventListener('click', () => {
    imageUpload.click();
  });

  imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      playlistImage.src = event.target.result;
      updatePlaylist(playlistId, { image: event.target.result });
      loadPlaylists();
    };
    reader.readAsDataURL(file);
  });
}

if (deletePlaylistBtn) {
  deletePlaylistBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlistId);
      window.location.href = 'library.html';
    }
  });
}

if (playAllBtn) {
  playAllBtn.addEventListener('click', () => {
    const playlist = getPlaylistById(playlistId);
    if (playlist?.tracks.length) {
      playTrack(playlist.tracks[0]);
    }
  });
}

const createPlaylistBtn = document.querySelector('#createPlaylistBtn');
if (createPlaylistBtn) {
  createPlaylistBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createPlaylist();
  });
}

async function init() {
  await loadData();
  renderPlaylist();
  loadPlaylists();
}
init();
