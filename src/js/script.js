const category = document.querySelector('#category');
const topTracks = document.querySelector('#top-tracks');
const audioPlayer = document.querySelector('.player');
const searchInput = document.querySelector('#searchInput');
const searchResults = document.querySelector('#searchResults');

let albums = [];
let tracks = [];

function getImagePath(filename) {
  const isInPages = window.location.pathname.includes('/pages/');

  if (isInPages) {
    return `../../src/images/${filename}`;
  }
  return `./images/${filename}`;
}

const APIController = function () {
  const getToken = async () => {
    const response = await fetch('http://localhost:3000/api/token');
    const data = await response.json();

    console.log('Token backend:', data.token);
    return data.token;
  };

  const getTopTracks = async () => {
    const response = await fetch('http://localhost:3000/api/top-tracks');
    const data = await response.json();

    console.log('Top tracks', data.tracks);
    return data.tracks;
  };

  const getTrack = async (token, trackUrl) => {
    const res = await fetch(trackUrl, {
      headers: { Authorization: 'Bearer ' + token },
    });
    const data = await res.json();
    return data;
  };

  const getAlbums = async () => {
    const response = await fetch('http://localhost:3000/api/albums');
    const data = await response.json();
    console.log('Albums: ', data.albums);
    return data.albums;
  };

  const getAlbumTracks = async (albumId) => {
    const response = await fetch(
      `http://localhost:3000/api/album/${albumId}/tracks`
    );
    const data = await response.json();
    console.log('Tracks album: ', data.tracks);
    return data.tracks;
  };

  return {
    getToken,
    getTopTracks,
    getTrack,
    getAlbums,
    getAlbumTracks,
  };
};

const api = APIController();
let token;

async function fetchTopTracks() {
  try {
    const tracks = await api.getTopTracks();
    return tracks;
  } catch (error) {
    console.error('Download error', error);
    return [];
  }
}

async function init() {
  console.log('App started');

  token = await api.getToken();
  albums = await api.getAlbums();

  if (category) {
    renderAlbumsList(albums);
  }

  tracks = await fetchTopTracks();

  if (topTracks) {
    renderTopTracksList(tracks);
  }

  loadLibrary();
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

const renderAlbumsList = (albums) => {
  const ulList = document.createElement('ul');

  albums.forEach((album) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const img = document.createElement('img');

    title.textContent = album.name;
    img.src = album.images[0]?.url || '';
    img.alt = album.name;

    li.appendChild(img);
    li.appendChild(title);

    li.addEventListener('click', async () => {
      // const tracks = await api.getAlbumTracks(album.id);
      // renderTopTracksList(tracks);
      // renderAlbumPopup({ ...album, tracks });
      renderAlbumPopup(album);
    });

    ulList.appendChild(li);
  });

  category.appendChild(ulList);
};

const renderTopTracksList = (tracks) => {
  if (!tracks || !Array.isArray(tracks)) return;

  topTracks.innerHTML = '';
  const ulList = document.createElement('ul');

  tracks.forEach((track) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const artist = document.createElement('h5');
    const img = document.createElement('img');
    const icon = document.createElement('img');

    title.textContent = track.name;
    artist.textContent = track.artists.map((a) => a.name).join(', ');
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
    });
    img.addEventListener('click', () => {
      renderDescriptionTrack(track);
    });

    ulList.appendChild(li);
  });

  topTracks.appendChild(ulList);
};

const renderDescriptionTrack = (track) => {
  const descriptionContainer = document.querySelector('#description-track');
  const trackContent = document.querySelector('.track-content');

  trackContent.innerHTML = '';

  trackContent.style.setProperty(
    '--bg-image',
    `url(${track.album?.images?.[0]?.url || ''})`
  );

  const topControls = document.createElement('div');
  topControls.classList.add('track-top-controls');

  const saveBtn = document.createElement('button');
  saveBtn.classList.add('btn-save');

  const saveIcon = document.createElement('img');
  saveIcon.width = 20;
  saveIcon.height = 20;

  const isSaved = (JSON.parse(localStorage.getItem('likedSongs')) || []).some(
    (t) => t.id === track.id
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

  img.src = track.album?.images?.[0]?.url || '';
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
};

const renderAlbumPopup = async (album) => {
  const albumPopup = document.querySelector('#album-popup');
  const albumContent = document.querySelector('.album-content');

  albumContent.innerHTML = '';

  albumContent.style.setProperty(
    '--bg-image',
    `url(${album.images[0]?.url || ''})`
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
    (a) => a.id === album.id
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
    const tracks = await api.getAlbumTracks(album.id);
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
      });

      li.appendChild(playBtn);
      ulList.appendChild(li);
    });

    albumContent.appendChild(ulList);
  } catch (err) {
    console.error('Error fetching album tracks:', err);
  }

  albumPopup.style.display = 'flex';
};

if (searchInput && searchResults) {
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();

    if (!query) {
      searchResults.innerHTML = '';
      return;
    }

    const filteredAlbums = albums.filter(
      (album) =>
        album.name.toLowerCase().includes(query) ||
        album.artists.some((artist) =>
          artist.name.toLowerCase().includes(query)
        )
    );

    const filteredTracks = tracks.filter(
      (track) =>
        track.name.toLowerCase().includes(query) ||
        track.artists.some((artist) =>
          artist.name.toLowerCase().includes(query)
        )
    );

    searchResults.innerHTML = '';

    if (filteredAlbums.length > 0) {
      const albumsHeader = document.createElement('h3');
      albumsHeader.textContent = 'Albums';
      albumsHeader.classList.add('search-section-header');
      searchResults.appendChild(albumsHeader);

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
      searchResults.appendChild(tracksHeader);

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

      searchResults.appendChild(tracksContainer);
    }
  });
}

function createPlaylist() {
  const playlists = JSON.parse(localStorage.getItem('playlists') || '');

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
}

function getPlaylists() {
  return JSON.parse(localStorage.getItem('playlists') || '');
}

function getPlaylistsById(id) {
  const playlists = getPlaylists();
  return playlists.find((el) => el.id === id);
}



init();
