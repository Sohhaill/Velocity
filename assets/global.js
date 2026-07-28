// global js

document.addEventListener('DOMContentLoaded', initMediaGrid);
if (document.readyState !== 'loading') initMediaGrid();

function initMediaGrid() {
  document.querySelectorAll('[data-v-mediagrid]').forEach(function(root) {
    if (root.__vMediaGridInit) return;
    root.__vMediaGridInit = true;

    var videos = root.querySelectorAll('.v-mediagrid__video');
    videos.forEach(function(v) {
      v.muted = true;
      v.playsInline = true;
      v.play().catch(function() {});
    });
  });

  document.addEventListener('shopify:section:load', function(e) {
    var root = e.target.querySelector('[data-v-mediagrid]');
    if (root) initMediaGrid();
  });
}





document.addEventListener('DOMContentLoaded', initInstaFeed);
if (document.readyState !== 'loading') initInstaFeed();

function initInstaFeed() {
  document.querySelectorAll('[data-v-insta]').forEach(function(root) {
    if (root.__vInstaInit) return;
    root.__vInstaInit = true;

    var swiperEl = root.querySelector('.v-insta__swiper');
    var prevBtn = root.querySelector('.v-insta__nav--prev');
    var nextBtn = root.querySelector('.v-insta__nav--next');

    var slidesDesktop = parseFloat(root.dataset.slidesDesktop) || 4;
    var slidesTablet = parseFloat(root.dataset.slidesTablet) || 2.2;
    var slidesMobile = parseFloat(root.dataset.slidesMobile) || 1.2;
    var gapDesktop = parseFloat(root.dataset.gapDesktop) || 20;
    var gapMobile = parseFloat(root.dataset.gapMobile) || 12;

    if (swiperEl && window.Swiper) {
      new Swiper(swiperEl, {
        slidesPerView: slidesMobile,
        spaceBetween: gapMobile,
        navigation: { prevEl: prevBtn, nextEl: nextBtn },
        mousewheel: {
          forceToAxis: true,
          sensitivity: 1,
          releaseOnEdges: true
        },
        breakpoints: {
          750: { slidesPerView: slidesTablet, spaceBetween: gapDesktop },
          990: { slidesPerView: slidesDesktop, spaceBetween: gapDesktop }
        }
      });
    }

    // Video hover play/pause
    root.querySelectorAll('.v-insta__item').forEach(function(item) {
      var video = item.querySelector('.v-insta__video');
      if (!video) return;
      item.addEventListener('mouseenter', function() {
        video.play().catch(function() {});
      });
      item.addEventListener('mouseleave', function() {
        video.pause();
        video.currentTime = 0;
      });
    });

    // Popup open
    function openPopup(targetId) {
      var target = document.getElementById(targetId);
      if (!target) return;
      target.classList.add('is-active');
      document.body.style.overflow = 'hidden';
       if (window.lenis) window.lenis.stop();
    }

    root.querySelectorAll('[data-insta-open]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        openPopup(btn.dataset.target);
       
      });
    });

    root.querySelectorAll('.v-insta__item').forEach(function(item) {
      var shopBtn = item.querySelector('[data-insta-open]');
      if (!shopBtn) return;

      var media = item.querySelector('.v-insta__media');
      var thumbs = item.querySelectorAll('.v-insta__thumb');

      if (media) {
        media.style.cursor = 'pointer';
        media.addEventListener('click', function() {
          openPopup(shopBtn.dataset.target);
        });
      }

      thumbs.forEach(function(thumb) {
        thumb.style.cursor = 'pointer';
        thumb.addEventListener('click', function(e) {
          e.stopPropagation();
          openPopup(shopBtn.dataset.target);
        });
      });
    });

    // Popup close
    document.querySelectorAll('[data-insta-popup]').forEach(function(popup) {
      popup.querySelectorAll('[data-insta-close]').forEach(function(closer) {
        closer.addEventListener('click', function() {
          popup.classList.remove('is-active');
          document.body.style.overflow = '';
          if (window.lenis) window.lenis.start();
        });
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('[data-insta-popup].is-active').forEach(function(popup) {
          popup.classList.remove('is-active');
        });
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('shopify:section:load', function(e) {
    var root = e.target.querySelector('[data-v-insta]');
    if (root) initInstaFeed();
  });
}

document.addEventListener('DOMContentLoaded', initHeaderSticky);
if (document.readyState !== 'loading') initHeaderSticky();

function initHeaderSticky() {
  document.querySelectorAll('[data-header-sticky="true"]').forEach(function(headerWrapper) {
    if (headerWrapper.__vHeaderStickyInit) return;
    headerWrapper.__vHeaderStickyInit = true;

    var scrollThreshold = parseFloat(headerWrapper.dataset.stickyThreshold) || 48.8;
    var isSticky = false;
    var ticking = false;

    function updateStickyState() {
      var scrolled = window.scrollY || window.pageYOffset;

      if (scrolled > scrollThreshold && !isSticky) {
        headerWrapper.classList.add('header--sticky');
        isSticky = true;
      } else if (scrolled <= scrollThreshold && isSticky) {
        headerWrapper.classList.remove('header--sticky');
        isSticky = false;
      }
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          updateStickyState();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateStickyState();
  });

  document.addEventListener('shopify:section:load', function(e) {
    var root = e.target.querySelector('[data-header-sticky="true"]');
    if (root) initHeaderSticky();
  });
}


document.addEventListener('DOMContentLoaded', initCursorFollow);
if (document.readyState !== 'loading') initCursorFollow();

function initCursorFollow() {
  if (window.__vCursorFollowInit) return;
  window.__vCursorFollowInit = true;

  document.addEventListener('mousemove', function (e) {
    var root = e.target.closest('[data-cursor-root]');
    if (!root) return;

    var cursor = root.querySelector('.v-cursor-close');
    if (!cursor) return;

    var overOverlay = e.target.closest('[data-cursor-overlay]');

    if (overOverlay && root.contains(overOverlay)) {
      cursor.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px) translate(-50%, -50%)';
      cursor.classList.add('is-active');
    } else {
      cursor.classList.remove('is-active');
    }
  });

  // Reset cursor jab bhi koi root (popup/drawer) close ho
  document.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-insta-close], [data-cursor-close-trigger]');
    if (!closer) return;
    var root = closer.closest('[data-cursor-root]');
    if (!root) return;
    var cursor = root.querySelector('.v-cursor-close');
    if (cursor) cursor.classList.remove('is-active');
  });
}