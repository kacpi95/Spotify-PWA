import { mainElements } from '../selectors/mainSelectors.js';
import { getImagePath } from '../photoPath.js';
import { playTrack } from '../../services/player.service.js';
import { toggleLikeTrack, toggleSaveAlbum } from '../library.js';
import { getAlbumTracks } from '../../services/api.service.js';

export function loadLibrary() {
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

export function renderAlbumsList(albums) {
  if (!albums || !Array.isArray(albums) || albums.length === 0) return;
  const { mainCategory } = mainElements;
  const ulList = document.createElement('ul');

  albums.forEach((album) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const img = document.createElement('img');

    title.textContent = album.name;
    img.src = album.images?.[0]?.url ?? '';
    img.alt = album.name;

    li.appendChild(img);
    li.appendChild(title);

    li.addEventListener('click', async () => {
      renderAlbumPopup(album);
    });

    ulList.appendChild(li);
  });

  mainCategory.appendChild(ulList);
}

export function renderTopTracksList(tracks) {
  if (!tracks || !Array.isArray(tracks)) return;

  const { mainTopTracks } = mainElements;

  mainTopTracks.innerHTML = '';
  const ulList = document.createElement('ul');

  tracks.forEach((track) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const artist = document.createElement('h5');
    const img = document.createElement('img');
    const icon = document.createElement('img');

    title.textContent = track.name;
    artist.textContent = (track.artists ?? []).map((a) => a.name).join(', ');
    img.src = track.album?.images?.[0]?.url;
    img.alt = track.name || 'Unknown track';
    icon.src = getImagePath('play-icon.png');
    icon.alt = 'play-icon';
    icon.classList.add('play-icon');

    li.appendChild(img);
    li.appendChild(title);
    li.appendChild(artist);
    li.appendChild(icon);

    icon.addEventListener('click', () => {
      playTrack(track);
    });
    img.addEventListener('click', () => {
      renderDescriptionTrack(track);
    });

    ulList.appendChild(li);
  });

  mainTopTracks.appendChild(ulList);
}

export function renderDescriptionTrack(track) {
  const descriptionContainer = document.querySelector('#description-track');
  const trackContent = document.querySelector('.track-content');

  trackContent.innerHTML = '';

  trackContent.style.setProperty(
    '--bg-image',
    `url(${track.album?.images?.[0]?.url || ''})`,
  );

  const topControls = document.createElement('div');
  topControls.classList.add('track-top-controls');

  const saveBtn = document.createElement('button');
  saveBtn.classList.add('btn-save');

  const saveIcon = document.createElement('img');
  saveIcon.width = 20;
  saveIcon.height = 20;

  const isSaved = (JSON.parse(localStorage.getItem('likedSongs')) || []).some(
    (t) => t.id === track.id,
  );
  saveIcon.src = isSaved
    ? getImagePath('check-icon.png')
    : getImagePath('plus-icon.png');
  saveBtn.appendChild(saveIcon);

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleLikeTrack(track);

    const nowSaved = (
      JSON.parse(localStorage.getItem('likedSongs')) || []
    ).some((t) => t.id === track.id);
    saveIcon.src = nowSaved
      ? getImagePath('check-icon.png')
      : getImagePath('plus-icon.png');
  });

  const iconClose = document.createElement('span');
  iconClose.textContent = '×';
  iconClose.classList.add('close-description');

  iconClose.addEventListener('click', () => {
    descriptionContainer.style.display = 'none';
  });

  topControls.appendChild(saveBtn);
  topControls.appendChild(iconClose);
  trackContent.appendChild(topControls);

  const img = document.createElement('img');
  const title = document.createElement('h2');
  const artist = document.createElement('h4');
  const album = document.createElement('p');
  const release = document.createElement('p');

  const textContainer = document.createElement('div');
  textContainer.classList.add('track-text-content');

  img.src = track.album?.images?.[0]?.url ?? '';
  title.textContent = track.name;
  artist.textContent = track.artists.map((a) => a.name).join(', ');
  album.textContent = `Album: ${track.album?.name || 'Unknown'}`;
  release.textContent = `Release date: ${
    track.album?.release_date || 'Unknown'
  }`;

  trackContent.appendChild(img);

  textContainer.appendChild(title);
  textContainer.appendChild(artist);
  textContainer.appendChild(album);
  textContainer.appendChild(release);

  trackContent.appendChild(textContainer);

  descriptionContainer.style.display = 'flex';

  descriptionContainer.addEventListener('click', (e) => {
    if (e.target === descriptionContainer) {
      descriptionContainer.style.display = 'none';
    }
  });
}

export async function renderAlbumPopup(album) {
  const albumPopup = document.querySelector('#album-popup');
  const albumContent = document.querySelector('.album-content');

  albumContent.innerHTML = '';

  albumContent.style.setProperty(
    '--bg-image',
    `url(${album.images[0]?.url || ''})`,
  );

  const topControls = document.createElement('div');
  topControls.classList.add('album-top-controls');

  const closeIcon = document.createElement('span');
  closeIcon.textContent = '×';
  closeIcon.classList.add('close-album');

  const saveBtn = document.createElement('button');
  saveBtn.classList.add('btn-save');

  const saveIcon = document.createElement('img');
  saveIcon.width = 20;
  saveIcon.height = 20;
  const isSaved = (JSON.parse(localStorage.getItem('savedAlbums')) || []).some(
    (a) => a.id === album.id,
  );
  saveIcon.src = isSaved
    ? getImagePath('check-icon.png')
    : getImagePath('plus-icon.png');
  saveBtn.appendChild(saveIcon);

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSaveAlbum(album);

    const nowSaved = (
      JSON.parse(localStorage.getItem('savedAlbums')) || []
    ).some((a) => a.id === album.id);
    saveIcon.src = nowSaved
      ? getImagePath('check-icon.png')
      : getImagePath('plus-icon.png');
  });

  closeIcon.addEventListener('click', () => {
    albumPopup.style.display = 'none';
  });

  topControls.appendChild(saveBtn);
  topControls.appendChild(closeIcon);
  albumContent.appendChild(topControls);

  const img = document.createElement('img');
  img.src = album.images[0]?.url || '';
  img.alt = album.name;

  const title = document.createElement('h2');
  title.textContent = album.name;

  const artist = document.createElement('h4');
  artist.textContent = album.artists.map((a) => a.name).join(', ');

  albumContent.appendChild(img);
  albumContent.appendChild(title);
  albumContent.appendChild(artist);

  try {
    const tracks = await getAlbumTracks(album.id);
    if (!tracks || !Array.isArray(tracks)) return;

    const ulList = document.createElement('ul');
    tracks.forEach((track, id) => {
      const li = document.createElement('li');
      li.textContent = `${id + 1}. ${track.name}`;

      const playBtn = document.createElement('img');
      playBtn.src = getImagePath('play-icon.png');
      playBtn.alt = 'play icon';
      playBtn.style.width = '24px';
      playBtn.style.height = '24px';

      playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        playTrack(track);
      });

      li.appendChild(playBtn);
      ulList.appendChild(li);
    });

    albumContent.appendChild(ulList);
  } catch (err) {
    console.error('Error fetching album tracks:', err);
  }

  albumPopup.style.display = 'flex';
}
