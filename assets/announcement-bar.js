(function () {
  function initVAnnoucment(root) {
    var items = root.querySelectorAll('.v-annoucment__ticker-item');
    if (items.length < 2) return;

    var speed = parseInt(root.getAttribute('data-speed'), 10) || 4000;
    var current = 0;
    var timer = null;

    function goToNext() {
      var next = (current + 1) % items.length;
      var oldItem = items[current];
      var newItem = items[next];

      oldItem.classList.remove('is-active');
      oldItem.classList.add('is-exit');

      newItem.classList.add('is-active');

      setTimeout(function () {
        oldItem.classList.remove('is-exit');
        oldItem.classList.add('is-reset');
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            oldItem.classList.remove('is-reset');
          });
        });
      }, 650);

      current = next;
    }

    function start() {
      stop();
      timer = setInterval(goToNext, speed);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    start();

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
  }

  function initAll() {
    document.querySelectorAll('[data-v-annoucment]').forEach(initVAnnoucment);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', function (e) {
    var el = e.target.querySelector('[data-v-annoucment]');
    if (el) initVAnnoucment(el);
  });
})();