function getImagePath(filename) {
  const isInPages = window.location.pathname.includes('/pages/');
  if (isInPages) {
    return `../../src/images/${filename}`;
  }
  return `./images/${filename}`;
}

function getPlaylists() {
  return JSON.parse(localStorage.getItem('playlists')) || [];
}

function getPlaylistById(id) {
  const playlists = getPlaylists();
  return playlists.find((el) => el.id === id);
}

function updatePlaylist(id, updates) {
  const playlists = getPlaylists();
  const index = playlists.findIndex((el) => el.id === id);

  if (index !== -1) {
    playlists[index] = { ...playlists[index], ...updates };
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }
}

function deletePlaylist(id) {
  let playlists = getPlaylists();
  playlists = playlists.filter((el) => el.id !== id);
  localStorage.setItem('playlists', JSON.stringify(playlists));
}

function addTrackToPlaylist(playlistId, track) {
  const playlists = getPlaylists();
  const playlist = playlists.find((el) => el.id === playlistId);

  if (playlist) {
    const exists = playlist.tracks.some((el) => el.id === track.id);

    if (!exists) {
      const trackToStore = {
        id: track.id,
        name: track.name,
        artists: track.artists,
        album: track.album,
      };

      playlist.tracks.push(trackToStore);
      localStorage.setItem('playlists', JSON.stringify(playlists));
      return true;
    }
  }
  return false;
}

function removeTrackFromPlaylist(playlistId, trackId) {
  const playlists = getPlaylists();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (playlist) {
    playlist.tracks = playlist.tracks.filter((t) => t.id !== trackId);
    localStorage.setItem('playlists', JSON.stringify(playlists));
  }
}

function createPlaylist() {
  const playlists = getPlaylists();

  const newPlaylist = {
    id: `playlist_${Date.now()}`,
    name: `My Playlist #${playlists.length + 1}`,
    image: getImagePath('plus-icon.png'),
    description: '',
    createdAt: new Date().toISOString(),
    tracks: [],
  };

  playlists.push(newPlaylist);
  localStorage.setItem('playlists', JSON.stringify(playlists));

  loadPlaylists();

  const isInPages = window.location.pathname.includes('/pages/');

  if (isInPages) {
    window.location.href = `./playlist.html?id=${newPlaylist.id}`;
  } else {
    window.location.href = `./pages/playlist.html?id=${newPlaylist.id}`;
  }
}

function loadPlaylists() {
  const playlistsListContainer = document.getElementById('playlistsList');

  if (!playlistsListContainer) return;

  const playlists = getPlaylists();

  playlistsListContainer.innerHTML = '';

  if (playlists.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No playlists yet';
    li.classList.add('no-playlists');
    playlistsListContainer.appendChild(li);
    return;
  }

  playlists.forEach((playlist) => {
    const li = document.createElement('li');
    li.classList.add('playlist-item');

    const link = document.createElement('a');

    const isInPages = window.location.pathname.includes('/pages/');

    if (isInPages) {
      link.href = `./playlist.html?id=${playlist.id}`;
    } else {
      link.href = `./pages/playlist.html?id=${playlist.id}`;
    }

    link.innerHTML = `
      <i class="fa-solid fa-list"></i>
      <span>${playlist.name}</span>
    `;

    li.appendChild(link);
    playlistsListContainer.appendChild(li);
  });
}
