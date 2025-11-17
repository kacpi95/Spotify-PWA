const category = document.querySelector('#category');
const topTracks = document.querySelector('#top-tracks');
const audioPlayer = document.querySelector('.player');

const APIController = function () {
  const getToken = async () => {
    const response = await fetch('http://localhost:3000/api/token');
    const data = await response.json();

    console.log('Token backend:', data.token);
    return data.token;
  };

  const getGenres = async () => {
    const response = await fetch('http://localhost:3000/api/genres');
    const data = await response.json();

    console.log('Categories: ', data.categories);
    return data.categories;
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

  return {
    getToken,
    getGenres,
    getTopTracks,
    getTrack,
  };
};

const api = APIController();
let token;
let currentPlayingLi = null;
let tracks = [];

async function fetchTopTracks() {
  try {
    const token = await api.getToken();
    tracks = await api.getTopTracks();

    const trackDetails = await api.getTrack(token, tracks[0].href);
    console.log('Details first track ', trackDetails);
    return tracks;
  } catch (error) {
    console.error('Download error', error);
  }
}

async function init() {
  console.log('App started');

  token = await api.getToken();
  const genres = await api.getGenres();
  renderCategoryList(genres);

  const topTracksData = await fetchTopTracks();
  renderTopTracksList(topTracksData);
}

const renderCategoryList = (categories) => {
  const ulList = document.createElement('ul');

  categories.forEach((el) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const img = document.createElement('img');

    title.textContent = el.name;
    img.src = el.icons[0].url;
    img.alt = el.name;

    li.appendChild(img);
    li.appendChild(title);

    ulList.appendChild(li);
  });

  category.appendChild(ulList);
};

const renderTopTracksList = (tracks) => {
  const ulList = document.createElement('ul');

  tracks.forEach((track) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const artist = document.createElement('h5');
    const img = document.createElement('img');

    title.textContent = track.name;
    artist.textContent = track.artists.map((a) => a.name).join(', ');
    img.src = track.album.images[0].url;
    img.alt = track.name;

    li.appendChild(img);
    li.appendChild(title);
    li.appendChild(artist);

    li.addEventListener('click', () => {
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

  topTracks.appendChild(ulList);
};

init();
