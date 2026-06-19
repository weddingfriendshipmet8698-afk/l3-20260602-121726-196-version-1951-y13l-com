(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mainNav = document.querySelector('[data-main-nav]');

    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
                showSlide(nextIndex);
            });
        });

        window.setInterval(function () {
            showSlide(index + 1);
        }, 5200);
    }

    var searchInput = document.querySelector('[data-search-input]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }

        var keyword = normalize(searchInput && searchInput.value);
        var typeValue = normalize(typeFilter && typeFilter.value);
        var yearValue = normalize(yearFilter && yearFilter.value);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-keywords'),
                card.getAttribute('data-year'),
                card.getAttribute('data-type')
            ].join(' '));
            var cardType = normalize(card.getAttribute('data-type'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
            var matchesYear = !yearValue || cardYear.indexOf(yearValue) !== -1;
            var isVisible = matchesKeyword && matchesType && matchesYear;

            card.hidden = !isVisible;
            if (isVisible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    [searchInput, typeFilter, yearFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });
})();
