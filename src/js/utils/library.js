import {
  loadLibrary,
  renderAlbumPopup,
  renderDescriptionTrack,
} from './renderers/mainRenderers.js';
import { mainElements } from './selectors/mainSelectors.js';
import { playTrack } from '../services/player.service.js';
import {
  showToast,
  removeTrackFromPlaylist,
  addTrackToPlaylist,
  getPlaylistById,
} from '../helpers.js';
import { renderPlaylist } from './renderers/playlistRenderers.js';
import { playlistElements } from './selectors/playlistSelectors.js';

export function toggleLikeTrack(track) {
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

export function toggleSaveAlbum(album) {
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

export function handleSearch(queryRaw, albums, tracks) {
  const { mainSearchResults } = mainElements;
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

    mainSearchResults.appendChild(albumsContainer);
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

export function handlePlayListSearch(queryRaw, playlistId, tracks) {
  const query = (queryRaw ?? '').toLowerCase().trim();
  const { playlistSearchResults } = playlistElements;

  playlistSearchResults.innerHTML = '';
  if (!query) return;

  const playlist = getPlaylistById(playlistId);
  if (!playlist) return;

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
