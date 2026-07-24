// scrolling-animation start

(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll('[data-v-scroll]').forEach(function (root) {
    var wrapper = root.querySelector('.v-scroll__wrapper');
    var track = root.querySelector('.v-scroll__track');
    if (!wrapper || !track) return;

    var pauseOnHover = wrapper.classList.contains('v-scroll__wrapper--pause-on-hover');
    var duration = parseFloat(root.dataset.duration) || 20; // seconds for one full loop
    var groupWidth = 0;
    var baseSpeed = 0;   // px per second
    var currentSpeed = 0;
    var targetSpeed = 0;
    var position = 0;
    var lastTime = null;

    function measure() {
      var firstGroup = track.querySelector('.v-scroll__group');
      groupWidth = firstGroup ? firstGroup.getBoundingClientRect().width : 0;
      baseSpeed = groupWidth / duration;
      targetSpeed = baseSpeed;
    }

    measure();
    window.addEventListener('resize', measure);

    if (pauseOnHover) {
      wrapper.addEventListener('mouseenter', function () { targetSpeed = 0; });
      wrapper.addEventListener('mouseleave', function () { targetSpeed = baseSpeed; });
    }

    function tick(time) {
      if (lastTime === null) lastTime = time;
      var delta = (time - lastTime) / 1000;
      lastTime = time;

      // ease current speed toward target — this is what makes pause/resume smooth instead of instant
      currentSpeed += (targetSpeed - currentSpeed) * Math.min(delta * 2.5, 1);

      position -= currentSpeed * delta;
      if (groupWidth > 0 && Math.abs(position) >= groupWidth) {
        position += groupWidth;
      }

      track.style.transform = 'translateX(' + position + 'px)';
      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
})();
// scrolling-animation end