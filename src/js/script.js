import {
  loadPlaylists,
  createPlaylist,
  debounce,
  showToast,
} from './helpers.js';
import { playTrack } from './services/player.service.js';
import {
  getToken,
  getAlbumTracks,
  getAlbums,
  getTopTracks,
} from './services/api.service.js';
import {
  renderAlbumsList,
  renderDescriptionTrack,
  renderAlbumPopup,
  renderTopTracksList,
} from './utils/renderers/mainRenderers.js';
import { mainElements } from './utils/selectors/mainSelectors.js';
import { getImagePath } from './utils/photoPath.js';

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

function loadLibrary() {
  const likedSongsContainer = document.getElementById('likedSongsContainer');
  const savedAlbumsContainer = document.getElementById('savedAlbumsContainer');

  const likedSongs = JSON.parse(localStorage.getItem('likedSongs')) || [];
  const savedAlbums = JSON.parse(localStorage.getItem('savedAlbums')) || [];

  if (likedSongsContainer) {
    likedSongsContainer.innerHTML = '';

    const ulList = document.createElement('ul');

    likedSongs.forEach((track) => {
      const li = document.createElement('li');
      const title = document.createElement('h3');
      const artist = document.createElement('h5');
      const img = document.createElement('img');
      const icon = document.createElement('img');

      title.textContent = track.name;
      artist.textContent = track.artists?.map((a) => a.name).join(', ') || '';
      img.src = track.album?.images?.[0]?.url || '';
      img.alt = track.name || 'Unknown track';
      icon.src = getImagePath('play-icon.png');
      icon.alt = 'play-icon';
      icon.classList.add('play-icon');

      li.appendChild(img);
      li.appendChild(title);
      li.appendChild(artist);
      li.appendChild(icon);

      img.addEventListener('click', () => {
        renderDescriptionTrack(track);
      });

      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        playTrack(track);
      });

      ulList.appendChild(li);
    });

    likedSongsContainer.appendChild(ulList);
  }

  if (savedAlbumsContainer) {
    savedAlbumsContainer.innerHTML = '';

    const ulList = document.createElement('ul');

    savedAlbums.forEach((album) => {
      const li = document.createElement('li');
      const title = document.createElement('h3');
      const img = document.createElement('img');

      title.textContent = album.name;
      img.src = album.images?.[0]?.url || '';
      img.alt = album.name;

      li.appendChild(img);
      li.appendChild(title);

      li.addEventListener('click', () => {
        renderAlbumPopup(album);
      });

      ulList.appendChild(li);
    });

    savedAlbumsContainer.appendChild(ulList);
  }
}

function toggleLikeTrack(track) {
  const key = 'likedSongs';
  let liked = JSON.parse(localStorage.getItem(key)) || [];
  const exists = liked.some((t) => t.id === track.id);

  if (exists) {
    liked = liked.filter((t) => t.id !== track.id);
  } else {
    const toStore = {
      id: track.id,
      name: track.name,
      artists: track.artists,
      album: track.album,
    };
    liked.push(toStore);
  }

  localStorage.setItem(key, JSON.stringify(liked));
  loadLibrary();
}

function toggleSaveAlbum(album) {
  const key = 'savedAlbums';
  let saved = JSON.parse(localStorage.getItem(key)) || [];
  const exists = saved.some((a) => a.id === album.id);

  if (exists) {
    saved = saved.filter((a) => a.id !== album.id);
  } else {
    const toStore = {
      id: album.id,
      name: album.name,
      images: album.images,
      artists: album.artists,
    };
    saved.push(toStore);
  }

  localStorage.setItem(key, JSON.stringify(saved));
  loadLibrary();
}

const albumPopupEl = document.querySelector('#album-popup');
if (albumPopupEl) {
  albumPopupEl.addEventListener('click', (e) => {
    if (e.target === albumPopupEl) albumPopupEl.style.display = 'none';
  });
}

function handleSearch(queryRaw) {
  const query = (queryRaw ?? '').toLowerCase().trim();

  mainSearchResults.innerHTML = '';
  if (!query) {
    return;
  }

  const filteredAlbums = albums.filter(
    (album) =>
      album.name.toLowerCase().includes(query) ||
      (album.artists ?? []).some((artist) =>
        artist?.name?.toLowerCase().includes(query),
      ),
  );

  const filteredTracks = tracks.filter(
    (track) =>
      track.name?.toLowerCase().includes(query) ||
      (track.artists ?? []).some((artist) =>
        artist?.name?.toLowerCase().includes(query),
      ),
  );

  mainSearchResults.innerHTML = '';

  if (filteredAlbums.length > 0) {
    const albumsHeader = document.createElement('h3');
    albumsHeader.textContent = 'Albums';
    albumsHeader.classList.add('search-section-header');
    mainSearchResults.appendChild(albumsHeader);

    const albumsContainer = document.createElement('div');
    albumsContainer.classList.add('search-albums-container');

    filteredAlbums.forEach((album) => {
      const div = document.createElement('div');
      div.classList.add('search-album');

      const img = document.createElement('img');
      img.src = album.images[0]?.url || '';
      img.alt = album.name;

      const title = document.createElement('span');
      title.textContent = album.name;

      div.appendChild(img);
      div.appendChild(title);

      div.addEventListener('click', () => renderAlbumPopup(album));

      albumsContainer.appendChild(div);
    });

    searchResults.appendChild(albumsContainer);
  }

  if (filteredTracks.length > 0) {
    const tracksHeader = document.createElement('h3');
    tracksHeader.textContent = 'Tracks: ';
    tracksHeader.classList.add('search-section-track');
    mainSearchResults.appendChild(tracksHeader);

    const tracksContainer = document.createElement('div');
    tracksContainer.classList.add('search-tracks-container');

    filteredTracks.forEach((track) => {
      const div = document.createElement('div');
      div.classList.add('search-track');

      const img = document.createElement('img');
      img.src = track.album.images[0]?.url || '';
      img.alt = track.name;

      const title = document.createElement('span');
      title.textContent = track.name;

      div.appendChild(img);
      div.appendChild(title);

      div.addEventListener('click', () => renderDescriptionTrack(track));

      tracksContainer.appendChild(div);
    });

    mainSearchResults.appendChild(tracksContainer);
  }
}

if (mainSearchInput && mainSearchResults) {
  const debounced = debounce((e) => handleSearch(e.target.value), 300);
  mainSearchInput.addEventListener('input', debounced);
}

if (mainCreatePlaylistBtn) {
  mainCreatePlaylistBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createPlaylist();
  });
}

init();
