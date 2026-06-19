const Hls = window.Hls;

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

function updateHeader() {
  if (!header) {
    return;
  }
  header.classList.toggle("scrolled", window.scrollY > 10);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

const hero = document.querySelector("[data-hero]");
if (hero) {
  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === current);
    });
  }

  if (prev) {
    prev.addEventListener("click", () => showSlide(current - 1));
  }

  if (next) {
    next.addEventListener("click", () => showSlide(current + 1));
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  window.setInterval(() => showSlide(current + 1), 5200);
}

const filterPanel = document.querySelector("[data-filter-panel]");
if (filterPanel) {
  const grid = document.querySelector("[data-filter-grid]");
  const cards = grid ? Array.from(grid.querySelectorAll("[data-card]")) : [];
  const emptyState = document.querySelector("[data-empty-state]");
  const searchInput = filterPanel.querySelector("[data-filter-input]");
  const typeSelect = filterPanel.querySelector("[data-filter-type]");
  const yearSelect = filterPanel.querySelector("[data-filter-year]");
  const categorySelect = filterPanel.querySelector("[data-filter-category]");

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function applyFilters() {
    const query = normalize(searchInput ? searchInput.value : "");
    const type = normalize(typeSelect ? typeSelect.value : "");
    const year = normalize(yearSelect ? yearSelect.value : "");
    const category = normalize(categorySelect ? categorySelect.value : "");
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = normalize([
        card.dataset.title,
        card.dataset.year,
        card.dataset.type,
        card.dataset.region,
        card.dataset.category,
        card.textContent
      ].join(" "));
      const matchesQuery = !query || haystack.includes(query);
      const matchesType = !type || normalize(card.dataset.type) === type;
      const matchesYear = !year || normalize(card.dataset.year) === year;
      const matchesCategory = !category || normalize(card.dataset.category) === category;
      const visible = matchesQuery && matchesType && matchesYear && matchesCategory;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visibleCount !== 0;
    }
  }

  [searchInput, typeSelect, yearSelect, categorySelect].forEach((control) => {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });
}

function attachStream(video, stream) {
  if (!video || !stream) {
    return Promise.resolve();
  }

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    if (video.src !== stream) {
      video.src = stream;
    }
    return video.play();
  }

  if (Hls && Hls.isSupported()) {
    if (!video.dataset.hlsReady) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(stream);
      hls.attachMedia(video);
      video.dataset.hlsReady = "true";
    }
    return video.play();
  }

  video.src = stream;
  return video.play();
}

const playButtons = Array.from(document.querySelectorAll("[data-play-button]"));
playButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const targetId = button.getAttribute("data-target");
    const stream = button.getAttribute("data-stream");
    const video = targetId ? document.getElementById(targetId) : button.parentElement.querySelector("video");
    button.classList.add("hidden");
    try {
      await attachStream(video, stream);
    } catch (error) {
      button.classList.remove("hidden");
    }
  });
});
