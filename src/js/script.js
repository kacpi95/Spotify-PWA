import { loadPlaylists, createPlaylist, debounce } from './helpers.js';
import { getToken, getAlbums, getTopTracks } from './services/api.service.js';
import {
  renderAlbumsList,
  renderTopTracksList,
} from './utils/renderers/mainRenderers.js';
import { mainElements } from './utils/selectors/mainSelectors.js';
import { handleSearch } from './utils/library.js';
import { loadLibrary } from './utils/renderers/mainRenderers.js';
import { requestNotification } from './services/notifications.service.js';

let albums = [];
let tracks = [];
let token;

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
