document.addEventListener('DOMContentLoaded', initProductCards);
if (document.readyState !== 'loading') initProductCards();

function initProductCards() {
  // Card media swiper + hover-zone navigation
  document.querySelectorAll('[data-card-swiper]').forEach(function(swiperEl) {
    if (swiperEl.__cardSwiperInit) return;
    swiperEl.__cardSwiperInit = true;

    var paginationEl = swiperEl.querySelector('.v-card__pagination');

    // Ensure YouTube/Vimeo iframes have JS API enabled
    swiperEl.querySelectorAll('.v-card__video-iframe').forEach(function(iframe) {
      var src = iframe.getAttribute('src');
      if (!src) return;
      if (src.indexOf('youtube') !== -1 && src.indexOf('enablejsapi') === -1) {
        var sep = src.indexOf('?') !== -1 ? '&' : '?';
        iframe.setAttribute('src', src + sep + 'enablejsapi=1');
      } else if (src.indexOf('player.vimeo.com') !== -1 && src.indexOf('api=1') === -1) {
        var vsep = src.indexOf('?') !== -1 ? '&' : '?';
        iframe.setAttribute('src', src + vsep + 'api=1');
      }
    });

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
        var iframe = slide.querySelector('.v-card__video-iframe');

        if (video) {
          if (i === instance.activeIndex) {
            video.play().catch(function() {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }

        if (iframe) {
          var isYouTube = iframe.src.indexOf('youtube') !== -1;
          var isVimeo = iframe.src.indexOf('vimeo') !== -1;

          if (i === instance.activeIndex) {
            if (isYouTube) {
              iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
              iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
            } else if (isVimeo) {
              iframe.contentWindow.postMessage(JSON.stringify({ method: 'setVolume', value: 0 }), '*');
              iframe.contentWindow.postMessage(JSON.stringify({ method: 'play' }), '*');
            }
          } else {
            if (isYouTube) {
              iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
            } else if (isVimeo) {
              iframe.contentWindow.postMessage(JSON.stringify({ method: 'pause' }), '*');
            }
          }
        }
      });
    }

    var isDesktopHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktopHover) return; // mobile/touch: skip zone-hover logic entirely

    var zoneTimer = null;
    var currentZone = 'neutral';
    var ZONE_INTERVAL = 400;

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