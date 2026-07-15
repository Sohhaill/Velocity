
  window.__cntdwnIntervals = window.__cntdwnIntervals || {};

  function vCntdwnPad(n) {
    return String(n).padStart(2, '0');
  }

  function vCntdwnInit(el) {
    if (!el || el.dataset.vCntdwnInit === 'true') return;
    el.dataset.vCntdwnInit = 'true';

    var sectionId = el.id;
    var endDateAttr = el.getAttribute('data-end-date');
    var expireAction = el.getAttribute('data-expire-action') || 'hide_timer';
    var target = endDateAttr ? new Date(endDateAttr).getTime() : null;

    if (!target || isNaN(target)) return; // no date set — nothing to run

    var contentEls = el.querySelectorAll('[data-v-cntdwn-hide-on-expire]');
    var expiredEl = el.querySelector('[data-v-cntdwn-expired]');
    var daysEl = el.querySelector('[data-days]');
    var hoursEl = el.querySelector('[data-hours]');
    var minsEl = el.querySelector('[data-minutes]');
    var secsEl = el.querySelector('[data-seconds]');

    function handleExpire() {
      if (window.__cntdwnIntervals[sectionId]) {
        clearInterval(window.__cntdwnIntervals[sectionId]);
        delete window.__cntdwnIntervals[sectionId];
      }
      if (expireAction === 'hide_section') {
        el.style.display = 'none';
      } else if (expireAction === 'hide_timer') {
        contentEls.forEach(function (node) { node.hidden = true; });
        if (expiredEl) expiredEl.hidden = false;
      }
      // expireAction === 'show_zeros' → leave numbers at 00:00:00:00, do nothing extra
    }

    function tick() {
      var diff = target - Date.now();

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        handleExpire();
        return;
      }

      var days = Math.floor(diff / 86400000);
      var hours = Math.floor((diff / 3600000) % 24);
      var mins = Math.floor((diff / 60000) % 60);
      var secs = Math.floor((diff / 1000) % 60);

      if (daysEl) daysEl.textContent = vCntdwnPad(days);
      if (hoursEl) hoursEl.textContent = vCntdwnPad(hours);
      if (minsEl) minsEl.textContent = vCntdwnPad(mins);
      if (secsEl) secsEl.textContent = vCntdwnPad(secs);
    }

    tick();
    window.__cntdwnIntervals[sectionId] = setInterval(tick, 1000);
  }

  // Scan and init every countdown currently in the DOM.
  // Safe to call repeatedly — per-element flag prevents double-binding.
  document.querySelectorAll('[data-v-cntdwn]').forEach(vCntdwnInit);

  if (!window.__cntdwnListenersInitialized) {
    window.__cntdwnListenersInitialized = true;

    if (Shopify && Shopify.designMode) {
      // Section re-rendered in editor — kill its old interval (if any)
      // and re-init fresh, so we never get two intervals racing.
      document.addEventListener('shopify:section:load', function (event) {
        var el = event.target.querySelector('[data-v-cntdwn]');
        if (!el) return;
        if (window.__cntdwnIntervals[el.id]) {
          clearInterval(window.__cntdwnIntervals[el.id]);
          delete window.__cntdwnIntervals[el.id];
        }
        el.dataset.vCntdwnInit = 'false';
        el.style.display = '';
        var expiredEl = el.querySelector('[data-v-cntdwn-expired]');
        var contentEls = el.querySelectorAll('[data-v-cntdwn-hide-on-expire]');
        if (expiredEl) expiredEl.hidden = true;
        contentEls.forEach(function (node) { node.hidden = false; });
        vCntdwnInit(el);
      });

      // Section removed/reordered — clear its interval so it doesn't
      // keep ticking in the background against a dead element.
      document.addEventListener('shopify:section:unload', function (event) {
        var el = event.target.querySelector('[data-v-cntdwn]');
        if (!el) return;
        if (window.__cntdwnIntervals[el.id]) {
          clearInterval(window.__cntdwnIntervals[el.id]);
          delete window.__cntdwnIntervals[el.id];
        }
      });
    }
  }

