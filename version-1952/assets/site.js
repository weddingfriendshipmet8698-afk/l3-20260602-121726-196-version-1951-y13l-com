(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5600);
    }

    showSlide(0);

    var urlParams = new URLSearchParams(window.location.search);
    var queryValue = urlParams.get("q") || "";
    var filterInput = document.querySelector("[data-filter-input]");

    if (filterInput && queryValue) {
      filterInput.value = queryValue;
    }

    function normalize(value) {
      return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter() {
      if (!filterInput) {
        return;
      }

      var keyword = normalize(filterInput.value);
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      var emptyState = document.querySelector("[data-empty-state]");
      if (emptyState) {
        emptyState.classList.toggle("is-visible", visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilter);
      applyFilter();
    }
  });
})();
