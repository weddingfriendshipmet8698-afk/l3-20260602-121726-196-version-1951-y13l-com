(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function initializeMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initializeHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initializeLocalFilters() {
    selectAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-year-filter]");
      var container = document.querySelector("[data-filter-list]");
      var empty = document.querySelector("[data-empty-state]");
      if (!input || !container) {
        return;
      }
      var cards = selectAll(".movie-card", container);

      function applyFilter() {
        var query = normalize(input.value);
        var selectedYear = year ? String(year.value || "") : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize(
            [
              card.getAttribute("data-title"),
              card.getAttribute("data-year"),
              card.getAttribute("data-region"),
              card.getAttribute("data-genre"),
              card.getAttribute("data-category"),
            ].join(" "),
          );
          var matchedText = !query || haystack.indexOf(query) !== -1;
          var matchedYear =
            !selectedYear || card.getAttribute("data-year") === selectedYear;
          var shouldShow = matchedText && matchedYear;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("visible", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      if (year) {
        year.addEventListener("change", applyFilter);
      }
    });
  }

  function movieCardTemplate(movie) {
    var description = movie.description || "";
    var tag = movie.tag || movie.category || "";
    return [
      '<article class="movie-card" data-title="' +
        escapeHtml(movie.title) +
        '" data-year="' +
        escapeHtml(movie.year) +
        '" data-region="' +
        escapeHtml(movie.region) +
        '" data-genre="' +
        escapeHtml(movie.genre) +
        '" data-category="' +
        escapeHtml(movie.category) +
        '">',
      '    <a class="poster-wrap" href="./' +
        escapeHtml(movie.file) +
        '" aria-label="' +
        escapeHtml(movie.title) +
        '">',
      '        <img src="' +
        escapeHtml(movie.cover) +
        '" alt="' +
        escapeHtml(movie.title) +
        '" loading="lazy">',
      '        <span class="card-badge">' + escapeHtml(tag) + "</span>",
      '        <span class="card-duration">' +
        escapeHtml(movie.duration) +
        "</span>",
      '        <span class="card-play">▶</span>',
      "    </a>",
      '    <div class="movie-card-body">',
      '        <h2><a href="./' +
        escapeHtml(movie.file) +
        '">' +
        escapeHtml(movie.title) +
        "</a></h2>",
      "        <p>" + escapeHtml(description) + "</p>",
      '        <div class="movie-meta">',
      "            <span>" + escapeHtml(movie.year) + "</span>",
      "            <span>" + escapeHtml(movie.region) + "</span>",
      "            <span>" + escapeHtml(movie.category) + "</span>",
      "        </div>",
      "    </div>",
      "</article>",
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initializeGlobalSearch() {
    var root = document.querySelector("[data-global-search]");
    var input = document.querySelector("[data-global-search-input]");
    var results = document.querySelector("[data-global-search-results]");
    var empty = document.querySelector("[data-global-empty]");
    var title = document.querySelector("[data-search-title]");
    if (!root || !input || !results || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var value = normalize(query);
      var list = value
        ? window.SEARCH_MOVIES.filter(function (movie) {
            return (
              normalize(
                [
                  movie.title,
                  movie.year,
                  movie.region,
                  movie.genre,
                  movie.category,
                  movie.tags,
                ].join(" "),
              ).indexOf(value) !== -1
            );
          }).slice(0, 120)
        : window.SEARCH_MOVIES.slice(0, 80);
      results.innerHTML = list.map(movieCardTemplate).join("");
      if (empty) {
        empty.classList.toggle("visible", list.length === 0);
      }
      if (title) {
        title.textContent = value ? "搜索结果" : "热门影片";
      }
    }

    root.addEventListener("submit", function (event) {
      event.preventDefault();
      render(input.value);
      var nextUrl = input.value
        ? "./search.html?q=" + encodeURIComponent(input.value)
        : "./search.html";
      window.history.replaceState(null, "", nextUrl);
    });

    selectAll("[data-search-keyword]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-search-keyword") || "";
        render(input.value);
        window.history.replaceState(
          null,
          "",
          "./search.html?q=" + encodeURIComponent(input.value),
        );
      });
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  function initializePlayers() {
    selectAll(".movie-player").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var stream = player.getAttribute("data-stream");
      var hlsReady = false;
      var starting = false;

      if (!video || !stream) {
        return;
      }

      function attachNative() {
        if (!video.getAttribute("src")) {
          video.src = stream;
        }
      }

      function attachHls() {
        if (hlsReady) {
          return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          attachNative();
          hlsReady = true;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          player._hls = hls;
          hlsReady = true;
          return Promise.resolve();
        }
        if (window.HlsLoading) {
          return window.HlsLoading.then(function () {
            if (window.Hls && window.Hls.isSupported()) {
              var hls = new window.Hls();
              hls.loadSource(stream);
              hls.attachMedia(video);
              player._hls = hls;
              hlsReady = true;
            } else {
              attachNative();
              hlsReady = true;
            }
          }).catch(function () {
            attachNative();
            hlsReady = true;
          });
        }
        attachNative();
        hlsReady = true;
        return Promise.resolve();
      }

      function play() {
        if (starting) {
          return;
        }
        starting = true;
        attachHls()
          .then(function () {
            if (overlay) {
              overlay.classList.add("hidden");
            }
            var action = video.play();
            if (action && typeof action.catch === "function") {
              action.catch(function () {});
            }
          })
          .finally(function () {
            starting = false;
          });
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initializeMenu();
    initializeHero();
    initializeLocalFilters();
    initializeGlobalSearch();
    initializePlayers();
  });
})();
