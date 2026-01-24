import { getImagePath } from '../photoPath.js';
import { playTrack } from '../../services/player.service.js';
import { getPlaylistById } from '../../helpers.js';
import { playlistElements } from '../selectors/playlistSelectors.js';

export function renderPlaylist(playlistId) {
  const playlist = getPlaylistById(playlistId);
  const {
    playlistImage,
    playlistTracksContainer,
    playlistName,
    playlistDescription,
    playlistTrackCount,
    playlistSearchResults,
  } = playlistElements;
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


    row.append(number, info, album);
    playlistTracksContainer.appendChild(row);

    row.addEventListener('click', () => {
      playTrack(track);
    });
  });
}
