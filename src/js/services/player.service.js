export function playTrack(track) {
  const audioPlayer = document.querySelector('.player, #audio-player');
  if (!audioPlayer) return;

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
