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