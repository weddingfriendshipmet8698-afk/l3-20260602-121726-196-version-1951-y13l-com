(function () {
  function initPlayer(player) {
    var video = player.querySelector('video');
    var button = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function prepare() {
      if (ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function play() {
      prepare();
      video.controls = true;
      player.classList.add('is-playing');
      video.play().catch(function () {});
    }

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      player.classList.add('is-playing');
    });

    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('.stream-player').forEach(initPlayer);
})();
