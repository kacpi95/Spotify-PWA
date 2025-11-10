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

let tracks = [];

async function fetchTopTracks() {
  try {
    const token = await api.getToken();
    tracks = await api.getTopTracks();

    if (tracks.length === 0) {
      console.warn('No songs');
      return;
    }

    const trackDetails = await api.getTrack(token, tracks[0].href);
    console.log('Details first track ', trackDetails);
  } catch (error) {
    console.error('Download error', error);
  }
}

async function init() {
  console.log('App started');

  await api.getGenres();
  await fetchTopTracks();
}

init();
