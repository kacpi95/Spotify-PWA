const APIController = function () {
  const idClient = '';
  const secrecKey = '';

  const getToken = async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(idClient + ':' + secrecKey),
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    const data = await response.json();
    return data.access_token;
  };

  const getGenres = async (token) => {
    const res = await fetch(
      'https://api.spotify.com/v1/browse/categories?locale=en_US',
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );

    const data = await res.json();
    return data.categories.items;
  };

  const getTracksList = async (token, tracksUrl) => {
    const res = await fetch(tracksUrl + '?limit=10', {
      headers: { Authorization: 'Bearer ' + token },
    });

    const data = await res.json();
    return data.items;
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
    getTracksList,
    getTrack,
  };
};

const api = APIController();

let tracks = [];

async function fetchTopTracks() {
  try {
    const token = await api.getToken();

    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=top&type=track&limit=15`,
      {
        headers: { Authorization: 'Bearer ' + token },
      }
    );

    const searchData = await searchResponse.json();
    tracks = searchData.tracks.items;
    console.log('Songs:', tracks);

    if (tracks.length > 0) {
      await api.getTrack(token, tracks[0].href);
    }
  } catch (error) {
    console.error('Not found:', error);
  }
}

fetchTopTracks();
