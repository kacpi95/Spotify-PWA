import { API_URL } from './config.js';
import {
  getImagePath,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addTrackToPlaylist,
  removeTrackFromPlaylist,
  createPlaylist,
  loadPlaylists,
  debounce,
  showToast,
} from './helpers.js';
import { playTrack } from './services/player.service.js';

const APIController = function () {
  const getToken = async () => {
    try {
      const response = await fetch(`${API_URL}/api/token`);
      if (!response) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.token;
    } catch (err) {
      console.error(`Token dowload error`, err);
    }
  };

  const getTopTracks = async () => {
    try {
      const response = await fetch(`${API_URL}/api/top-tracks`);
      if (!response) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data.tracks;
    } catch (err) {
      console.error(`Top tracks download error`, err);
    }
  };

  return {
    getToken,
    getTopTracks,
  };
};

const api = APIController();

let tracks = [];

async function loadData() {
  try {
    tracks = await api.getTopTracks();
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

function renderPlaylist() {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return;

  if (!playlistTracksContainer) return;

  playlistImage.src =
    playlist.image && playlist.image.startsWith('data:')
      ? playlist.image
      : getImagePath('plus-icon.png');
  playlistName.textContent = playlist.name;
  playlistDescription.textContent =
    playlist.description || 'Add a description...';
  playlistTrackCount.textContent = `${playlist.tracks.length} songs`;

  playlistSearchResults.innerHTML = '';

  if (playlist.tracks.length === 0) {
    const p = document.createElement('p');
    p.className = 'no-tracks';
    p.textContent = 'No tracks!';
    playlistTracksContainer.innerHTML = '';
    playlistTracksContainer.appendChild(p);
    return;
  }

  playlistTracksContainer.innerHTML = '';

  playlist.tracks.forEach((track, index) => {
    const row = document.createElement('div');
    row.className = 'playlist-track-row';
    row.dataset.trackId = track.id;

    const number = document.createElement('span');
    number.className = 'track-number';
    number.textContent = index + 1;

    const info = document.createElement('div');
    info.className = 'track-info';

    const img = document.createElement('img');
    img.src = track.album?.images?.[0]?.url ?? '';
    img.alt = track.name;

    const textBox = document.createElement('div');

    const name = document.createElement('div');
    name.className = 'track-name';
    name.textContent = track.name;

    const artist = document.createElement('div');
    artist.className = 'track-artist';
    artist.textContent = track.artists?.map((a) => a.name).join(', ') || '';

    textBox.appendChild(name);
    textBox.appendChild(artist);

    info.appendChild(img);
    info.appendChild(textBox);

    const album = document.createElement('span');
    album.className = 'track-album-name';
    album.textContent = track.album?.name || '';

    const btn = document.createElement('button');
    btn.className = 'btn-remove-track';
    btn.dataset.trackId = track.id;
    btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';

    row.append(number, info, album, btn);
    playlistTracksContainer.appendChild(row);

    row.addEventListener('click', () => {
      playTrack(track);
    });
  });
}

function handlePlayListSearch(queryRaw) {
  const query = (queryRaw ?? '').toLowerCase().trim();

  playlistSearchResults.innerHTML = '';
  if (!query) {
    return;
  }

  const filteredTracks = tracks.filter((track) => {
    return (
      track.name?.toLowerCase().includes(query) ||
      (track.artists ?? []).some((artist) =>
        artist?.name?.toLowerCase().includes(query),
      )
    );
  });

  if (filteredTracks.length === 0) {
    const p = document.createElement('p');
    p.className = 'no-results';
    p.textContent = 'No results found';
    playlistSearchResults.appendChild(p);
    return;
  }

  filteredTracks.forEach((track) => {
    const trackItem = document.createElement('div');
    trackItem.classList.add('search-result-item');

    const playlist = getPlaylistById(playlistId);
    const isInPlaylist = playlist.tracks.some((t) => t.id === track.id);

    trackItem.innerHTML = '';

    const img = document.createElement('img');
    img.src = track.album?.images?.[0]?.url ?? '';
    img.alt = track.name;

    const info = document.createElement('div');
    info.className = 'search-result-info';
    info.textContent = track.name;

    const nameEl = document.createElement('div');
    nameEl.className = 'search-result-name';
    nameEl.textContent = track.name;

    const artistEl = document.createElement('div');
    artistEl.className = 'search-result-artist';
    artistEl.textContent = track.artists?.map((a) => a.name).join(', ') || '';

    info.appendChild(nameEl);
    info.appendChild(artistEl);

    const btn = document.createElement('button');
    btn.className = 'btn-add-track';
    btn.dataset.trackId = track.id;

    const icon = document.createElement('i');
    const label = document.createElement('span');

    function buttonState(added) {
      btn.classList.toggle('added', added);

      icon.className = added ? 'fa-solid fa-check' : 'fa-solid fa-plus';

      label.textContent = added ? 'Added' : 'Add';

      btn.replaceChildren(icon, label);
    }

    buttonState(isInPlaylist);

    trackItem.append(img, info, btn);

    const addBtn = trackItem.querySelector('.btn-add-track');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();

      if (!isInPlaylist) {
        const success = addTrackToPlaylist(playlistId, track);
        if (success) {
          addBtn.classList.add('added');
          addBtn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
          renderPlaylist();
          showToast(`Added "${track.name}" to playlist`);
        }
      } else {
        removeTrackFromPlaylist(playlistId, track.id);
        addBtn.classList.remove('added');
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add';
        renderPlaylist();
        showToast(`Removed "${track.name}" from playlist`);
      }
    });

    trackItem.addEventListener('click', () => {
      playTrack(track);
    });

    playlistSearchResults.appendChild(trackItem);
  });
}

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
