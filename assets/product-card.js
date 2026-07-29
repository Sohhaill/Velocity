document.addEventListener('DOMContentLoaded', initProductCards);
if (document.readyState !== 'loading') initProductCards();

function initProductCards() {
  // Wishlist toggle
  document.querySelectorAll('[data-wishlist-toggle]').forEach(function(btn) {
    if (btn.__wishlistInit) return;
    btn.__wishlistInit = true;

    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var pressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!pressed));
    });
  });

  // Card media swiper + hover-zone navigation
  document.querySelectorAll('[data-card-swiper]').forEach(function(swiperEl) {
    if (swiperEl.__cardSwiperInit) return;
    swiperEl.__cardSwiperInit = true;

    var paginationEl = swiperEl.querySelector('.v-card__pagination');

    var swiper = new Swiper(swiperEl, {
      loop: false,
      allowTouchMove: true,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      resizeObserver: true,
      pagination: paginationEl ? { el: paginationEl, clickable: false } : false,
      on: {
        slideChangeTransitionEnd: function() {
          updateVideos(this);
        },
        init: function() {
          updateVideos(this);
          this.update();
        }
      }
    });

    // Extra safety: recalc after full page load (fonts/images can shift grid width)
    window.addEventListener('load', function() {
      swiper.update();
    });

    function updateVideos(instance) {
      instance.slides.forEach(function(slide, i) {
        var video = slide.querySelector('.v-card__video');
        if (!video) return;
        if (i === instance.activeIndex) {
          video.play().catch(function() {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    }

    var isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktopHover) return; // mobile/touch: skip zone-hover logic entirely

    var zoneTimer = null;
    var currentZone = 'neutral';
    var ZONE_INTERVAL = 900;

    function setZone(newZone) {
      if (newZone === currentZone) return;
      currentZone = newZone;
      clearInterval(zoneTimer);
      zoneTimer = null;

      if (newZone === 'next') {
        zoneTimer = setInterval(function() {
          swiper.slideNext();
        }, ZONE_INTERVAL);
      } else if (newZone === 'prev') {
        zoneTimer = setInterval(function() {
          swiper.slidePrev();
        }, ZONE_INTERVAL);
      }
    }

    swiperEl.addEventListener('mousemove', function(e) {
      var rect = swiperEl.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var pct = x / rect.width;

      if (pct < 0.33) {
        setZone('prev');
      } else if (pct > 0.66) {
        setZone('next');
      } else {
        setZone('neutral');
      }
    });

    swiperEl.addEventListener('mouseleave', function() {
      clearInterval(zoneTimer);
      zoneTimer = null;
      currentZone = 'neutral';
    });
  });

  document.addEventListener('shopify:section:load', initProductCards);
}