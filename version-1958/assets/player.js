(function () {
  var video = document.querySelector('.movie-video');
  var button = document.querySelector('[data-play-button]');
  if (!video || !button) {
    return;
  }

  var stream = video.getAttribute('data-stream');
  var ready = false;
  var setup = function () {
    if (ready || !stream) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }
  };

  var play = function () {
    setup();
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {});
    }
    button.classList.add('is-hidden');
  };

  button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    button.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    button.classList.remove('is-hidden');
  });
})();
