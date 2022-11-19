export function constuctPlayer(container, sourceAudio) {
  const mainContainer = document.createElement('div');
  mainContainer.classList.add('audio-player');

  const audioComponent = document.createElement('audio');
  audioComponent.src = sourceAudio;
  audioComponent.setAttribute('preload', 'metadata');

  const playButton = document.createElement('img');
  playButton.alt = '';
  playButton.classList.add('audio-play');
  playButton.src = require('../../assets/play.png');

  const stopButton = document.createElement('img');
  stopButton.alt = '';
  stopButton.style.display = 'none';
  stopButton.classList.add('audio-stop');
  stopButton.src = require('../../assets/stop.png');

  const audioTrack = document.createElement('input');
  audioTrack.classList.add('audio-track');
  audioTrack.setAttribute('type', 'range');
  audioTrack.setAttribute('min', '0');
  audioTrack.setAttribute('max', '100');
  audioTrack.setAttribute('value', '0');
  audioTrack.setAttribute('step', '1');

  const volume = document.createElement('input');
  volume.classList.add('audio-volume');
  volume.setAttribute('type', 'range');
  volume.setAttribute('min', '0');
  volume.setAttribute('max', '1');
  volume.setAttribute('value', '1');
  volume.setAttribute('step', '0.1');

  const timer = document.createElement('p');
  timer.classList.add('audio-timer');
  timer.innerHTML = '00:00';

  const audioLength = document.createElement('p');
  audioLength.classList.add('audio-length');
  audioComponent.onloadedmetadata = function(){
    let allSec  = audioComponent.duration;
    let secAudio = Math.floor(allSec%60) > 10 
                ? Math.floor(allSec%60) 
                : '0' + Math.floor(allSec%60);
    audioLength.innerHTML = `0${Math.floor(allSec/60)}:${secAudio}`;
  }

  mainContainer.appendChild(audioComponent);
  mainContainer.appendChild(playButton);
  mainContainer.appendChild(stopButton);
  mainContainer.appendChild(audioTrack);
  mainContainer.appendChild(volume);
  mainContainer.appendChild(timer);
  mainContainer.appendChild(audioLength);

  container.appendChild(mainContainer);


  playButton.addEventListener('click', () => {
    audioComponent.play();

    playButton.style.display = 'none';
    stopButton.style.display = 'block';
  });

  stopButton.addEventListener('click', () => {
    audioComponent.pause();

    playButton.style.display = 'block';
    stopButton.style.display = 'none';
  });

  audioComponent.addEventListener('timeupdate', () => {
    const t = Math.floor(audioComponent.currentTime
      / audioComponent.duration
      * 100);
    let sec = Math.floor(audioComponent.currentTime);
    let min = Math.floor(sec / 60);
    sec = sec - min * 60;
    timer.innerHTML = `${zFill(min.toString(), 2)}:${zFill(sec.toString(), 2)}`;

    audioTrack.value = t;
  });

  function zFill(str, n) {
    if (str.length < n) {
      return '0'.repeat(n - str.length) + str;
    }
    return str;
  }

  audioTrack.addEventListener('input', () => {
    const t = audioTrack.value * audioComponent.duration / 100;
    audioComponent.currentTime = t;
  });

  volume.addEventListener('input', () => {
    audioComponent.volume = volume.value;
  });

  audioComponent.addEventListener('ended', () => {
    playButton.style.display = 'block';
    stopButton.style.display = 'none';
    audioComponent.currentTime = 0;
  });
}
