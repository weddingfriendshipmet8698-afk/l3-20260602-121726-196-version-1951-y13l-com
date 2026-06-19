document.addEventListener("DOMContentLoaded", function () {
  initializeMobileMenu();
  initializeHeroCarousel();
  initializeLocalFilters();
  initializeSearchPage();
});

function initializeMobileMenu() {
  const button = document.querySelector("[data-mobile-menu-button]");
  const menu = document.querySelector("[data-mobile-menu]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function initializeHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  const previousButton = carousel.querySelector("[data-hero-prev]");
  const nextButton = carousel.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  function startAutoPlay() {
    stopAutoPlay();
    timer = window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  function stopAutoPlay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      const index = Number(dot.dataset.heroDot || 0);
      showSlide(index);
      startAutoPlay();
    });
  });

  if (previousButton) {
    previousButton.addEventListener("click", function () {
      showSlide(activeIndex - 1);
      startAutoPlay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", function () {
      showSlide(activeIndex + 1);
      startAutoPlay();
    });
  }

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);
  showSlide(0);
  startAutoPlay();
}

function initializeLocalFilters() {
  const scopes = Array.from(document.querySelectorAll("[data-filter-scope]"));

  scopes.forEach(function (scope) {
    const queryInput = scope.querySelector("[data-filter-query]");
    const yearSelect = scope.querySelector("[data-filter-year]");
    const typeSelect = scope.querySelector("[data-filter-type]");
    const regionSelect = scope.querySelector("[data-filter-region]");
    const countTarget = scope.querySelector("[data-filter-count]");
    const cards = Array.from(scope.querySelectorAll("[data-movie-card]"));

    function updateCards() {
      const query = normalize(queryInput ? queryInput.value : "");
      const year = yearSelect ? yearSelect.value : "";
      const type = typeSelect ? typeSelect.value : "";
      const region = regionSelect ? regionSelect.value : "";
      let visibleCount = 0;

      cards.forEach(function (card) {
        const text = normalize([
          card.dataset.title,
          card.dataset.year,
          card.dataset.type,
          card.dataset.region,
          card.dataset.genre
        ].join(" "));

        const isMatched = (!query || text.includes(query)) &&
          (!year || card.dataset.year === year) &&
          (!type || card.dataset.type === type) &&
          (!region || card.dataset.region === region);

        card.classList.toggle("is-hidden", !isMatched);

        if (isMatched) {
          visibleCount += 1;
        }
      });

      if (countTarget) {
        countTarget.textContent = String(visibleCount);
      }
    }

    [queryInput, yearSelect, typeSelect, regionSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", updateCards);
        element.addEventListener("change", updateCards);
      }
    });

    updateCards();
  });
}

function initializeSearchPage() {
  const page = document.querySelector("[data-search-page]");

  if (!page || !Array.isArray(window.MOVIE_DATA)) {
    return;
  }

  const form = page.querySelector("[data-search-form]");
  const input = page.querySelector("[data-search-input]");
  const categorySelect = page.querySelector("[data-search-category]");
  const yearInput = page.querySelector("[data-search-year]");
  const typeInput = page.querySelector("[data-search-type]");
  const results = page.querySelector("[data-search-results]");
  const summary = page.querySelector("[data-search-summary]");
  const urlParams = new URLSearchParams(window.location.search);

  if (input) {
    input.value = urlParams.get("q") || "";
  }

  if (categorySelect) {
    categorySelect.value = urlParams.get("category") || "";
  }

  if (yearInput) {
    yearInput.value = urlParams.get("year") || "";
  }

  if (typeInput) {
    typeInput.value = urlParams.get("type") || "";
  }

  function updateResults() {
    const query = normalize(input ? input.value : "");
    const category = categorySelect ? categorySelect.value : "";
    const year = normalize(yearInput ? yearInput.value : "");
    const type = normalize(typeInput ? typeInput.value : "");

    const matched = window.MOVIE_DATA.filter(function (movie) {
      const haystack = normalize([
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.categoryName,
        movie.tags,
        movie.oneLine
      ].join(" "));

      return (!query || haystack.includes(query)) &&
        (!category || movie.categorySlug === category) &&
        (!year || normalize(movie.year).includes(year)) &&
        (!type || normalize(movie.type).includes(type));
    });

    renderSearchResults(matched, results, summary);
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      updateResults();
      const params = new URLSearchParams();

      if (input && input.value.trim()) {
        params.set("q", input.value.trim());
      }

      if (categorySelect && categorySelect.value) {
        params.set("category", categorySelect.value);
      }

      if (yearInput && yearInput.value.trim()) {
        params.set("year", yearInput.value.trim());
      }

      if (typeInput && typeInput.value.trim()) {
        params.set("type", typeInput.value.trim());
      }

      const nextUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, "", nextUrl);
    });
  }

  [input, categorySelect, yearInput, typeInput].forEach(function (element) {
    if (element) {
      element.addEventListener("input", updateResults);
      element.addEventListener("change", updateResults);
    }
  });

  updateResults();
}

function renderSearchResults(movies, container, summary) {
  if (!container || !summary) {
    return;
  }

  const limit = 240;
  const visibleMovies = movies.slice(0, limit);

  summary.textContent = `共找到 ${movies.length} 部影片${movies.length > limit ? `，当前显示前 ${limit} 部` : ""}`;
  container.innerHTML = "";

  visibleMovies.forEach(function (movie) {
    const article = document.createElement("article");
    article.className = "movie-card";
    article.innerHTML = `
      <a class="poster-link" href="./${escapeAttribute(movie.url)}" aria-label="观看 ${escapeAttribute(movie.title)}">
        <img src="${escapeAttribute(movie.cover)}" alt="${escapeAttribute(movie.title)} 海报" loading="lazy">
        <span class="poster-shade"></span>
        <span class="year-badge">${escapeHtml(movie.year)}</span>
        <span class="poster-play">▶</span>
      </a>
      <div class="movie-card-body">
        <a class="movie-card-title" href="./${escapeAttribute(movie.url)}">${escapeHtml(movie.title)}</a>
        <div class="movie-meta">
          <span>${escapeHtml(movie.region)}</span>
          <span>${escapeHtml(movie.type)}</span>
          <span>${escapeHtml(movie.score)}分</span>
        </div>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${renderTags(movie.tags)}</div>
      </div>
    `;
    container.appendChild(article);
  });
}

function renderTags(tags) {
  return String(tags || "")
    .split(/[，,、/]+/)
    .filter(Boolean)
    .slice(0, 3)
    .map(function (tag) {
      return `<span>${escapeHtml(tag.trim())}</span>`;
    })
    .join("");
}

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}
