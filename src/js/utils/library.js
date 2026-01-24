import {
  loadLibrary,
  renderAlbumPopup,
  renderDescriptionTrack,
} from './renderers/mainRenderers.js';
import { mainElements } from './selectors/mainSelectors.js';

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
