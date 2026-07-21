(function () {
  function formatUnit(value) {
    value = Math.max(0, value);
    return value < 10 ? "0" + value : "" + value;
  }

  function initCountdown(item) {
    if (!item || item.dataset.countdownInit === "true") return;
    item.dataset.countdownInit = "true";

    var days = parseInt(item.getAttribute("data-days"), 10) || 0;
    var hours = parseInt(item.getAttribute("data-hours"), 10) || 0;
    var minutes = parseInt(item.getAttribute("data-minutes"), 10) || 0;
    var seconds = parseInt(item.getAttribute("data-seconds"), 10) || 0;

    var totalSeconds = (days * 86400) + (hours * 3600) + (minutes * 60) + seconds;

    var daysEl = item.querySelector('[data-unit="days"]');
    var hoursEl = item.querySelector('[data-unit="hours"]');
    var minutesEl = item.querySelector('[data-unit="minutes"]');
    var secondsEl = item.querySelector('[data-unit="seconds"]');

    function render() {
      var d = Math.floor(totalSeconds / 86400);
      var h = Math.floor((totalSeconds % 86400) / 3600);
      var m = Math.floor((totalSeconds % 3600) / 60);
      var s = totalSeconds % 60;

      if (daysEl) daysEl.textContent = formatUnit(d);
      if (hoursEl) hoursEl.textContent = formatUnit(h);
      if (minutesEl) minutesEl.textContent = formatUnit(m);
      if (secondsEl) secondsEl.textContent = formatUnit(s);
    }

    render();

    var interval = setInterval(function () {
      if (totalSeconds <= 0) {
        clearInterval(interval);
        return;
      }
      totalSeconds -= 1;
      render();
    }, 1000);

    item.__countdownInterval = interval;
  }

  function initVAnnoucment(root) {
    if (!root || root.dataset.vAnnoucmentInit === "true") return;
    root.dataset.vAnnoucmentInit = "true";

    var items = root.querySelectorAll(".v-annoucment__ticker-item");
    items.forEach(function (item) {
      if (item.hasAttribute("data-countdown")) initCountdown(item);
    });

    if (items.length < 2) return;

    var autoplayEnabled = root.getAttribute("data-autoplay") !== "false";
    var speed = parseInt(root.getAttribute("data-speed"), 10) || 4000;
    var current = 0;
    var timer = null;

    function goTo(index) {
      var oldItem = items[current];
      var newItem = items[index];
      if (oldItem === newItem) return;

      oldItem.classList.remove("is-active");
      oldItem.classList.add("is-exit");

      newItem.classList.add("is-active");

      setTimeout(function () {
        oldItem.classList.remove("is-exit");
        oldItem.classList.add("is-reset");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            oldItem.classList.remove("is-reset");
          });
        });
      }, 650);

      current = index;
    }

    function goToNext() {
      goTo((current + 1) % items.length);
    }

    function goToPrev() {
      goTo((current - 1 + items.length) % items.length);
    }

    function start() {
      stop();
      if (!autoplayEnabled) return;
      timer = setInterval(goToNext, speed);
    }

    function stop() {
      if (timer) clearInterval(timer);
    }

    start();

    if (autoplayEnabled) {
      root.addEventListener("mouseenter", stop);
      root.addEventListener("mouseleave", start);
    }

    var prevBtn = root.querySelector(".v-annoucment__nav--prev");
    var nextBtn = root.querySelector(".v-annoucment__nav--next");

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToPrev();
        start();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToNext();
        start();
      });
    }
  }

  function initAll() {
    document.querySelectorAll("[data-v-annoucment]").forEach(initVAnnoucment);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  document.addEventListener("shopify:section:load", function (e) {
    var el = e.target.querySelector("[data-v-annoucment]");
    if (el) {
      el.dataset.vAnnoucmentInit = "false";
      el.querySelectorAll(".v-annoucment__ticker-item").forEach(function (item) {
        item.dataset.countdownInit = "false";
        if (item.__countdownInterval) clearInterval(item.__countdownInterval);
      });
      initVAnnoucment(el);
    }
  });
})();