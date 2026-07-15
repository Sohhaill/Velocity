(function () {
  if (window.__megaMenuInit) return;
  window.__megaMenuInit = true;

  var openTimer, closeTimer;
  var OPEN_DELAY = 80;
  var CLOSE_DELAY = 200;

  function triggerFor(id) {
    return document.querySelector('[data-mega-menu-trigger="' + id + '"]');
  }
  function panelFor(id) {
    return document.getElementById("MegaMenu-" + id);
  }

  // Panel is now a SIBLING of the trigger link (not nested inside
  // it), so we resolve the shared "id" from whichever one the
  // mouse/focus event actually landed on.
  function idFromEl(el) {
    if (!el || !el.closest) return null;
    var trigger = el.closest("[data-mega-menu-trigger]");
    if (trigger) return trigger.getAttribute("data-mega-menu-trigger");
    var panel = el.closest(".mega-menu[data-mega-menu]");
    if (panel) return panel.id.replace("MegaMenu-", "");
    return null;
  }

  function isWithinGroup(el, id) {
    if (!el || !id) return false;
    var trigger = triggerFor(id);
    var panel = panelFor(id);
    return (trigger && trigger.contains(el)) || (panel && panel.contains(el));
  }

  function closeAll(exceptId) {
    document.querySelectorAll(".mega-menu.is-active").forEach(function (el) {
      var id = el.id.replace("MegaMenu-", "");
      if (id !== exceptId) {
        el.classList.remove("is-active");
        el.setAttribute("aria-hidden", "true");
        var trigger = triggerFor(id);
        if (trigger) trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  function openMenuById(id) {
    var panel = panelFor(id);
    if (!panel) return;
    clearTimeout(closeTimer);
    openTimer = setTimeout(function () {
      closeAll(id);
      panel.classList.add("is-active");
      panel.setAttribute("aria-hidden", "false");
      var trigger = triggerFor(id);
      if (trigger) trigger.setAttribute("aria-expanded", "true");
    }, OPEN_DELAY);
  }

  function scheduleCloseById(id) {
    clearTimeout(openTimer);
    closeTimer = setTimeout(function () {
      var panel = panelFor(id);
      if (panel) {
        panel.classList.remove("is-active");
        panel.setAttribute("aria-hidden", "true");
      }
      var trigger = triggerFor(id);
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }, CLOSE_DELAY);
  }

  document.addEventListener("mouseover", function (e) {
    var id = idFromEl(e.target);
    if (id) openMenuById(id);
  });

  document.addEventListener("mouseout", function (e) {
    var id = idFromEl(e.target);
    if (!id) return;
    if (isWithinGroup(e.relatedTarget, id)) return;
    scheduleCloseById(id);
  });

  document.addEventListener("focusin", function (e) {
    var id = idFromEl(e.target);
    if (id) openMenuById(id);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll(null);
  });
})();
