const APIController = function () {
  const getToken = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/token');
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
      const response = await fetch('http://localhost:3000/api/top-tracks');
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

  playlistImage.src = playlist.image || getImagePath('plus-icon.png');
  playlistName.textContent = playlist.name;
  playlistDescription.textContent =
    playlist.description || 'Add a description...';
  playlistTrackCount.textContent = `${playlist.tracks.length} songs`;

  playlistSearchResults.innerHTML = '';

  if (playlist.tracks.length === 0) {
    playlistTracksContainer.innerHTML = '<p class="no-tracks">No tracks !</p>';
    return;
  }

  playlist.tracks.forEach((track, index) => {
    const trackRow = document.createElement('div');
    trackRow.classList.add('playlist-track-row');

    trackRow.innerHTML = `
      <span class="track-number">${index + 1}</span>
      <div class="track-info">
        <img src="${track.album?.images?.[0]?.url || ''}" alt="${track.name}" />
        <div>
          <div class="track-name">${track.name}</div>
          <div class="track-artist">${
            track.artists?.map((a) => a.name).join(', ') || ''
          }</div>
        </div>
      </div>
      <span class="track-album-name">${track.album?.name || ''}</span>
      <button class="btn-remove-track" data-track-id="${track.id}">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    trackRow.addEventListener('click', (e) => {
      if (!e.target.closest('.btn-remove-track')) {
        playTrack(track);
      }
    });

    playlistSearchResults.appendChild(trackRow);
  });

  document.querySelectorAll('.btn-remove-track').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackId = btn.dataset.trackId;
      removeTrackFromPlaylist(playlistId, trackId);
      renderPlaylist();

      if (playlistSearchInput && playlistSearchInput.value) {
        playlistSearchInput.dispatchEvent(new Event('input'));
      }
    });
  });
}

if (playlistSearchInput && playlistSearchResults) {
  playlistSearchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
      playlistSearchResults.innerHTML = '';
      return;
    }

    const filteredTracks = tracks.filter((track) => {
      return (
        track.name.toLowerCase().includes(query) ||
        track.artists.some((artist) =>
          artist.name.toLowerCase().includes(query)
        )
      );
    });

    playlistSearchResults.innerHTML = '';

    if (filteredTracks.length === 0) {
      playlistSearchResults.innerHTML =
        '<p class="no-results">No results found</p>';
      return;
    }

    filteredTracks.forEach((track) => {
      const trackItem = document.createElement('div');
      trackItem.classList.add('search-result-item');

      const playlist = getPlaylistById(playlistId);
      const isInPlaylist = playlist.tracks.some((t) => t.id === track.id);

      trackItem.innerHTML = `
        <img src="${track.album?.images?.[0]?.url || ''}" alt="${track.name}" />
        <div class="search-result-info">
          <div class="search-result-name">${track.name}</div>
          <div class="search-result-artist">${
            track.artists?.map((a) => a.name).join(', ') || ''
          }</div>
        </div>
        <button class="btn-add-track ${
          isInPlaylist ? 'added' : ''
        }" data-track-id="${track.id}">
          ${
            isInPlaylist
              ? '<i class="fa-solid fa-check"></i> Added'
              : '<i class="fa-solid fa-plus"></i> Add'
          }
        </button>
      `;

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
  });
}

playlistName.addEventListener('blur', () => {
  updatePlaylist(playlistId, { name: playlistName.textContent });
  loadPlaylists();
});

playlistDescription.addEventListener('blur', () => {
  updatePlaylist(playlistId, { description: playlistDescription.textContent });
});

changeImageBtn.addEventListener('click', () => {
  imageUpload.click();
});

imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target.result;
      playlistImage.src = imageUrl;
      updatePlaylist(playlistId, { image: imageUrl });
      loadPlaylists();
    };
    reader.readAsDataURL(file);
  }
});

deletePlaylistBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to delete this playlist?')) {
    deletePlaylist(playlistId);
    window.location.href = 'library.html';
  }
});

function playTrack(track) {
  const audioPlayer = document.querySelector('.player');
  let iframe = audioPlayer.querySelector('iframe');

  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.width = '500';
    iframe.height = '80';
    iframe.frameBorder = '0';
    iframe.allow = 'encrypted-media';
    audioPlayer.appendChild(iframe);
  }

  iframe.src = `https://open.spotify.com/embed/track/${track.id}`;
}

playAllBtn.addEventListener('click', () => {
  const playlist = getPlaylistById(playlistId);
  if (playlist.tracks.length > 0) {
    playTrack(playlist.tracks[0]);
  }
});

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
