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
    var slidesMobile = parseFloat(root.dataset.slidesMobile) || 1.2;
    var gapDesktop = parseFloat(root.dataset.gapDesktop) || 20;
    var gapMobile = parseFloat(root.dataset.gapMobile) || 12;

    if (swiperEl && window.Swiper) {
      new Swiper(swiperEl, {
        slidesPerView: slidesMobile,
        spaceBetween: gapMobile,
        navigation: { prevEl: prevBtn, nextEl: nextBtn },
        breakpoints: {
          750: { slidesPerView: slidesDesktop, spaceBetween: gapDesktop }
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
    root.querySelectorAll('[data-insta-open]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = document.getElementById(btn.dataset.target);
        if (!target) return;
        target.classList.add('is-active');
        document.body.style.overflow = 'hidden';
      });
    });

    // Popup close
    document.querySelectorAll('[data-insta-popup]').forEach(function(popup) {
      popup.querySelectorAll('[data-insta-close]').forEach(function(closer) {
        closer.addEventListener('click', function() {
          popup.classList.remove('is-active');
          document.body.style.overflow = '';
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