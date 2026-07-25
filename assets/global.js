document.addEventListener('DOMContentLoaded', initVScroll);
if (document.readyState !== 'loading') initVScroll();

function initVScroll() {
  document.querySelectorAll('[data-v-scroll]').forEach(function(root) {
    if (root.__vScrollInit) return; // prevent double-init
    root.__vScrollInit = true;

    var wrapper = root.querySelector('.v-scroll__wrapper');
    var track = root.querySelector('.v-scroll__track');
    if (!track) return;

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    var durationSetting = parseFloat(root.dataset.speed) || 20;
    var groupWidth = 0;
    var basePxPerFrame = 0;

    function measure() {
      groupWidth = track.scrollWidth / 4;
      basePxPerFrame = groupWidth / (durationSetting * 60);
    }
    measure();
    window.addEventListener('resize', measure);

    var pos = 0;
    var currentSpeed = 0;
    var direction = -1;
    var isHovering = false;
    var scrollBoost = 0;
    var lastY = window.scrollY;
    var boostTimer;

    window.addEventListener('scroll', function() {
      var y = window.scrollY;
      var delta = y - lastY;
      lastY = y;
      if (Math.abs(delta) < 0.5) return;

      direction = delta > 0 ? -1 : 1;
      scrollBoost = Math.min(Math.abs(delta) * 0.35, 20);

      clearTimeout(boostTimer);
      boostTimer = setTimeout(function() { scrollBoost = 0; }, 200);
    }, { passive: true });

    if (wrapper) {
      wrapper.addEventListener('mouseenter', function() { isHovering = true; });
      wrapper.addEventListener('mouseleave', function() { isHovering = false; });
    }

    function tick() {
      var target = isHovering ? 0 : (basePxPerFrame + scrollBoost);
      currentSpeed += (target - currentSpeed) * 0.07;

      pos += currentSpeed * direction;

      if (pos <= -groupWidth) pos += groupWidth;
      if (pos > 0) pos -= groupWidth;

      track.style.transform = 'translateX(' + pos + 'px)';
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  // Theme Editor: re-init on section reload
  document.addEventListener('shopify:section:load', function(e) {
    var root = e.target.querySelector('[data-v-scroll]');
    if (root) initVScroll();
  });
}