const playlistImage = document.getElementById('playlistImage');
const playlistName = document.getElementById('playlistName');
const playlistDescription = document.getElementById('playlistDescription');
const playlistTrackCount = document.getElementById('playlistTrackCount');
const playlistTracksContainer = document.getElementById('playlistTracks');
const changeImageBtn = document.getElementById('changeImageBtn');
const imageUpload = document.getElementById('imageUpload');
const deletePlaylistBtn = document.getElementById('deletePlaylistBtn');
const playAllBtn = document.getElementById('playAllBtn');

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

  playlistTracksContainer.innerHTML = '';

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

    playlistTracksContainer.appendChild(trackRow);
  });

  document.querySelectorAll('.btn-remove-track').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackId = btn.dataset.trackId;
      removeTrackFromPlaylist(playlistId, trackId);
      renderPlaylist();
    });
  });
}
