(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function activate(index) {
      current = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function next() {
      activate((current + 1) % slides.length);
    }

    function start() {
      stop();
      timer = window.setInterval(next, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        activate(index);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var panel = document.querySelector("[data-search-panel]");
    var index = window.SEARCH_INDEX || [];
    if (!forms.length || !panel || !index.length) {
      return;
    }

    function render(query) {
      var q = normalize(query);
      if (!q) {
        panel.hidden = true;
        panel.innerHTML = "";
        return;
      }
      var matches = index.filter(function (item) {
        return normalize(item.title + " " + item.region + " " + item.genre + " " + item.year + " " + item.type).indexOf(q) !== -1;
      }).slice(0, 12);

      if (!matches.length) {
        panel.hidden = false;
        panel.innerHTML = '<div class="search-result"><div></div><div><strong>未找到匹配影片</strong><p>可以尝试更换片名、地区或题材关键词。</p></div></div>';
        return;
      }

      panel.hidden = false;
      panel.innerHTML = matches.map(function (item) {
        var title = escapeHtml(item.title);
        var region = escapeHtml(item.region);
        var year = escapeHtml(item.year);
        var genre = escapeHtml(item.genre);
        var url = String(item.url || "./index.html");
        var cover = String(item.cover || "./1.jpg");
        return '<a class="search-result" href="' + url + '">' +
          '<img src="' + cover + '" alt="' + title + '">' +
          '<div><strong>' + title + '</strong><p>' + region + ' · ' + year + ' · ' + genre + '</p></div>' +
          '<span>查看</span>' +
          '</a>';
      }).join("");
    }

    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        render(input.value);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var q = normalize(input.value);
        var first = index.find(function (item) {
          return normalize(item.title + " " + item.region + " " + item.genre + " " + item.year + " " + item.type).indexOf(q) !== -1;
        });
        if (first) {
          window.location.href = first.url;
        } else {
          render(input.value);
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && !event.target.closest("[data-search-form]")) {
        panel.hidden = true;
      }
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-list]");
    if (!panel) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
    var keyword = panel.querySelector("[data-filter-keyword]");

    function apply() {
      var values = {};
      selects.forEach(function (select) {
        values[select.getAttribute("data-filter")] = normalize(select.value);
      });
      var text = normalize(keyword ? keyword.value : "");

      cards.forEach(function (card) {
        var pass = true;
        Object.keys(values).forEach(function (key) {
          if (values[key] && normalize(card.getAttribute("data-" + key)) !== values[key]) {
            pass = false;
          }
        });
        if (text) {
          var haystack = normalize(
            card.getAttribute("data-title") + " " +
            card.getAttribute("data-region") + " " +
            card.getAttribute("data-year") + " " +
            card.getAttribute("data-type") + " " +
            card.getAttribute("data-genre")
          );
          if (haystack.indexOf(text) === -1) {
            pass = false;
          }
        }
        card.classList.toggle("is-hidden", !pass);
      });
    }

    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    if (keyword) {
      keyword.addEventListener("input", apply);
    }
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initFilters();
  });
})();
