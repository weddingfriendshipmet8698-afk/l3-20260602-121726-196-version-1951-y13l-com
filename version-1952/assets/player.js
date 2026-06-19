(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player-wrap]"));

    players.forEach(function (wrap) {
      var video = wrap.querySelector("video[data-player]");
      var button = wrap.querySelector("[data-play-button]");
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      var stream = video.getAttribute("data-stream");

      function attachStream() {
        if (!stream || video.getAttribute("data-ready") === "1") {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.setAttribute("data-ready", "1");
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          video.setAttribute("data-ready", "1");
          return;
        }

        video.src = stream;
        video.setAttribute("data-ready", "1");
      }

      function startPlayback() {
        attachStream();
        button.classList.add("is-hidden");
        video.controls = true;
        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
          playTask.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", startPlayback);

      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove("is-hidden");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
