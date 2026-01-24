import {
  loadPlaylists,
  createPlaylist,
  debounce,
  showToast,
} from './helpers.js';
import { getToken, getAlbums, getTopTracks } from './services/api.service.js';
import {
  renderAlbumsList,
  renderTopTracksList,
} from './utils/renderers/mainRenderers.js';
import { mainElements } from './utils/selectors/mainSelectors.js';
import { handleSearch } from './utils/library.js';
import { loadLibrary } from './utils/renderers/mainRenderers.js';

let albums = [];
let tracks = [];

const { mainSearchInput, mainSearchResults, mainCreatePlaylistBtn } =
  mainElements;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        console.log('SW registered', reg.scope);
      })
      .catch((err) => {
        console.error('SW registration failed', err);
      });
  });
}

let token;

async function init() {
  const { mainCategory, mainTopTracks } = mainElements;
  await requestNotification();

  token = await getToken();
  albums = await getAlbums();
  tracks = await getTopTracks();

  if (mainCategory) {
    renderAlbumsList(albums);
  }

  if (mainTopTracks) {
    renderTopTracksList(tracks);
  }

  loadPlaylists();
  loadLibrary();
}

async function requestNotification() {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    showToast('Notifications are enabled');
  } else if (Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('Notifications enabled');
      } else {
        showToast('Notifications denied');
      }
    } catch (err) {
      console.error('Notification request failed', err);
      showToast('Notification error');
    }
  } else if (Notification.permission === 'denied') {
    showToast('Notifications are blocked in your browser');
  }
}

const albumPopupEl = document.querySelector('#album-popup');
if (albumPopupEl) {
  albumPopupEl.addEventListener('click', (e) => {
    if (e.target === albumPopupEl) albumPopupEl.style.display = 'none';
  });
}

if (mainSearchInput && mainSearchResults) {
  const debounced = debounce(
    (e) => handleSearch(e.target.value, albums, tracks),
    300,
  );
  mainSearchInput.addEventListener('input', debounced);
}

if (mainCreatePlaylistBtn) {
  mainCreatePlaylistBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createPlaylist();
  });
}

init();
