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
playlistName.addEventListener('blur', () => {
  updatePlaylist(playlistId, { name: playlistName.textContent });
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
