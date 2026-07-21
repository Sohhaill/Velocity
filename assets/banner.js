(function () {
  function initVBanner(root) {
    if (!root || root.dataset.vBannerInit === "true") return;
    if (typeof Swiper === "undefined") return;
    root.dataset.vBannerInit = "true";

    var swiperEl = root.querySelector(".v-banner__swiper");
    if (!swiperEl) return;

    var effect = root.getAttribute("data-effect") || "slide";
    var autoplayEnabled = root.getAttribute("data-autoplay") === "true";
    var autoplaySpeed =
      parseInt(root.getAttribute("data-autoplay-speed"), 10) || 5000;
    var navigationEnabled = root.getAttribute("data-navigation") === "true";
    var paginationEnabled = root.getAttribute("data-pagination") === "true";

    var config = {
      effect: effect,
      speed: 1200,
      loop: true,
      slidesPerView: 1,
      watchSlidesProgress: true,
      a11y: true,
    };

    if (effect === "fade") {
      config.fadeEffect = { crossFade: true };
    }
    if (effect === "coverflow") {
      config.coverflowEffect = {
        rotate: 20,
        stretch: 0,
        depth: 150,
        modifier: 1,
        slideShadows: false,
      };
      config.centeredSlides = true;
    }

    if (autoplayEnabled) {
      config.autoplay = {
        delay: autoplaySpeed,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      };
    }

    if (navigationEnabled) {
      config.navigation = {
        nextEl: root.querySelector(".v-banner__nav--next"),
        prevEl: root.querySelector(".v-banner__nav--prev"),
      };
    }

    if (paginationEnabled) {
      config.pagination = {
        el: root.querySelector(".v-banner__pagination"),
        clickable: true,
        renderBullet: function (index, className) {
          return '<span class="' + className + '">' + (index + 1) + "</span>";
        },
      };
    }

    var progressBarEl = root.querySelector(".v-banner__progress-bar");
    if (progressBarEl && autoplayEnabled) {
      config.on = config.on || {};

      config.on.autoplayTimeLeft = function (swiper, timeLeft, progress) {
        progressBarEl.style.transitionDuration = "0s";
        progressBarEl.style.transform = "scaleX(" + (1 - progress) + ")";
      };

      config.on.slideChangeTransitionStart = function () {
        // Reset instantly then let the next autoplayTimeLeft tick animate it back up
        progressBarEl.style.transitionDuration = "0s";
        progressBarEl.style.transform = "scaleX(0)";
      };
    }

    var swiperInstance = new Swiper(swiperEl, config);
    root.__vBannerSwiperInstance = swiperInstance;
    // FEATURED PRODUCT SWIPERS — one nested instance per slide
    root.querySelectorAll(".v-banner__featured-swiper").forEach(function (el) {
      var slidesCount = el.querySelectorAll(".swiper-slide").length;
      if (slidesCount < 1) return;

      var featuredConfig = {
        slidesPerView: 1,
        loop: slidesCount > 1,
        speed: 600,
        a11y: true,
        observer: true,
        observeParents: true,
      };

      if (slidesCount > 1) {
        featuredConfig.navigation = {
          nextEl: el.querySelector(".v-banner__featured-nav-btn--next"),
          prevEl: el.querySelector(".v-banner__featured-nav-btn--prev"),
        };
      }

      el.__vBannerFeaturedInstance = new Swiper(el, featuredConfig);
    });

    // Height 0 -> 100% transition ke baad Swiper ko sahi size pe update karo,
    // warna init ke time height 0 hone se slide width galat calculate hoti hai
    root.querySelectorAll(".v-banner__featured").forEach(function (el) {
      el.addEventListener("transitionend", function (e) {
        if (e.propertyName !== "grid-template-rows") return;
        var swiperEl = el.querySelector(".v-banner__featured-swiper");
        if (swiperEl && swiperEl.__vBannerFeaturedInstance) {
          swiperEl.__vBannerFeaturedInstance.update();
        }
      });
    });
    // Only the active slide's video should play — keeps things light and avoids
    // multiple background videos competing for bandwidth/decoding at once.
    function syncVideos() {
      swiperEl.querySelectorAll("video").forEach(function (video) {
        video.pause();
      });
      var activeSlide = swiperEl.querySelector(".swiper-slide-active");
      if (!activeSlide) return;
      activeSlide.querySelectorAll("video").forEach(function (video) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) playPromise.catch(function () {});
      });
    }

    syncVideos();
    swiperInstance.on("slideChangeTransitionEnd", syncVideos);
  }

  function destroyVBanner(root) {
    if (!root) return;
    if (root.__vBannerSwiperInstance) {
      root.__vBannerSwiperInstance.destroy(true, true);
      delete root.__vBannerSwiperInstance;
    }
    root.querySelectorAll(".v-banner__featured-swiper").forEach(function (el) {
      if (el.__vBannerFeaturedInstance) {
        el.__vBannerFeaturedInstance.destroy(true, true);
        delete el.__vBannerFeaturedInstance;
      }
    });
    root.dataset.vBannerInit = "false";
  }

  function scanAndInit(context) {
    (context || document)
      .querySelectorAll("[data-v-banner]")
      .forEach(initVBanner);
  }

  // Init every banner instance currently on the page.
  // Safe with multiple sections since each is guarded by its own dataset flag.
  scanAndInit(document);

  if (!window.__vBannerListenersInitialized) {
    window.__vBannerListenersInitialized = true;

    if (window.Shopify && Shopify.designMode) {
      document.addEventListener("shopify:section:load", function (event) {
        var root = event.target.querySelector("[data-v-banner]");
        if (!root) return;
        destroyVBanner(root);
        initVBanner(root);
      });

      document.addEventListener("shopify:section:unload", function (event) {
        var root = event.target.querySelector("[data-v-banner]");
        destroyVBanner(root);
      });

      // Jumps to the slide being edited in the theme editor sidebar,
      // and pauses autoplay so it doesn't fight the editor selection.
      document.addEventListener("shopify:block:select", function (event) {
        var root = event.target.closest("[data-v-banner]");
        if (!root || !root.__vBannerSwiperInstance) return;
        var idx = parseInt(event.target.getAttribute("data-slide-index"), 10);
        if (isNaN(idx)) return;
        root.__vBannerSwiperInstance.slideToLoop(idx);
        if (root.__vBannerSwiperInstance.autoplay) {
          root.__vBannerSwiperInstance.autoplay.stop();
        }
      });
    }
  }
})();
