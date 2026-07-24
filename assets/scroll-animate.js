/**
 * Scroll Animate — lightweight AOS replacement
 * Usage: <div data-animate="fade-up" data-animate-delay="200" data-animate-duration="600">
 */
(function() {
  if (window.scrollAnimateInit) return;
  window.scrollAnimateInit = true;

  var DEFAULT_THRESHOLD = 0.55;
  var DEFAULT_OFFSET = '0px 0px -8% 0px';

  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      var el = entry.target;
      if (entry.isIntersecting) {
        el.classList.add('is-animated');
        if (el.dataset.animateRepeat !== 'true') {
          io.unobserve(el);
        }
      } else if (el.dataset.animateRepeat === 'true') {
        el.classList.remove('is-animated');
      }
    });
  }, { threshold: DEFAULT_THRESHOLD, rootMargin: DEFAULT_OFFSET });

  function setupElement(el) {
    var delay = el.dataset.animateDelay;
    var duration = el.dataset.animateDuration;
    var easing = el.dataset.animateEasing;

    if (delay) el.style.setProperty('--animate-delay', delay + 'ms');
    if (duration) el.style.setProperty('--animate-duration', duration + 'ms');
    if (easing) el.style.setProperty('--animate-easing', easing);

    io.observe(el);
  }

  function scan(root) {
    root = root || document;
    root.querySelectorAll('[data-animate]:not(.scroll-animate-bound)').forEach(function(el) {
      el.classList.add('scroll-animate-bound');
      setupElement(el);
    });
  }

  scan();

  // Re-scan when Shopify Theme Editor loads/reorders a section
  document.addEventListener('shopify:section:load', function(e) { scan(e.target); });

  // Re-scan on dynamically injected content (e.g. AJAX cart, quick view)
  window.scrollAnimateRefresh = scan;
})();