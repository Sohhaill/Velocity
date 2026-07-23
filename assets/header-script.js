  if (window.__headerScriptsInitialized) {
    document.currentScript.remove();
  } else {
    window.__headerScriptsInitialized = true;

    function openHeaderDrawer(event) {
      if (!event || !event.isTrusted) return;
      var drawer = document.getElementById('header-drawer');
      if (!drawer) return;
      drawer.classList.add('header__drawer--open');
      drawer.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('header-drawer-open');
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    }

    function closeHeaderDrawer() {
      var drawer = document.getElementById('header-drawer');
      if (!drawer) return;
      drawer.classList.remove('header__drawer--open');
      drawer.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('header-drawer-open');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }

    function openSearchPopup(event) {
      if (!event || !event.isTrusted) return;
      var popup = document.getElementById('search-popup');
      var input = document.getElementById('search-popup-input');
      if (!popup) return;

      popup.classList.add('search-popup--open');
      popup.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('search-popup-open');

      if (input) {
        window.setTimeout(function () {
          input.focus();
        }, 0);
      }
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    }

    function closeSearchPopup() {
      var popup = document.getElementById('search-popup');
      if (!popup) return;
      popup.classList.remove('search-popup--open');
      popup.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('search-popup-open');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }

    // expose globally so onclick="" attributes keep working across re-renders
    window.openHeaderDrawer = openHeaderDrawer;
    window.closeHeaderDrawer = closeHeaderDrawer;
    window.openSearchPopup = openSearchPopup;
    window.closeSearchPopup = closeSearchPopup;

    document.addEventListener('click', function (event) {
      var drawer = document.getElementById('header-drawer');
      if (!drawer || !drawer.classList.contains('header__drawer--open')) return;
      if (event.target.closest('.header__drawer-panel')) return;
      if (event.target.closest('.header__toggle')) return;
      closeHeaderDrawer();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeHeaderDrawer();
        closeSearchPopup();
      }
    });

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-search-popup-close]')) {
        closeSearchPopup();
      }
    });

    // ---- FIX: force-reset state whenever Theme Editor re-renders this section ----
    function forceResetHeaderUI() {
      var drawer = document.getElementById('header-drawer');
      var popup = document.getElementById('search-popup');
      if (drawer) {
        drawer.classList.remove('header__drawer--open');
        drawer.setAttribute('aria-hidden', 'true');
      }
      if (popup) {
        popup.classList.remove('search-popup--open');
        popup.setAttribute('aria-hidden', 'true');
      }
      document.documentElement.classList.remove('header-drawer-open', 'search-popup-open');
      document.body.style.overflow = '';
    }

    // Drawer submenu accordion — re-bind on every load since DOM is fresh
    function updateDrawerSubmenuHeight(item) {
      var submenu = item ? item.querySelector(':scope > .header__drawer-submenu') : null;
      if (!item || !submenu) return;
      if (item.classList.contains('header__drawer-item--open')) {
        submenu.style.maxHeight = '100%';
      } else {
        submenu.style.maxHeight = '0px';
      }
      var parentItem = item.parentElement ? item.parentElement.closest('.header__drawer-item--open') : null;
      if (parentItem) {
        requestAnimationFrame(function () {
          updateDrawerSubmenuHeight(parentItem);
        });
      }
    }

    function closeDrawerItem(item) {
      if (!item) return;
      item.classList.remove('header__drawer-item--open');
      var toggle = item.querySelector(':scope > .header__drawer-item-top .header__drawer-submenu-toggle');
      var submenu = item.querySelector(':scope > .header__drawer-submenu');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (submenu) submenu.style.maxHeight = '0px';
      item.querySelectorAll('.header__drawer-item--open').forEach(function (childOpenItem) {
        childOpenItem.classList.remove('header__drawer-item--open');
        var childToggle = childOpenItem.querySelector(':scope > .header__drawer-item-top .header__drawer-submenu-toggle');
        var childSubmenu = childOpenItem.querySelector(':scope > .header__drawer-submenu');
        if (childToggle) childToggle.setAttribute('aria-expanded', 'false');
        if (childSubmenu) childSubmenu.style.maxHeight = '0px';
      });
    }

    document.addEventListener('click', function (event) {
      var toggle = event.target.closest('.header__drawer-submenu-toggle');
      if (!toggle) return;
      var item = toggle.closest('.header__drawer-item');
      var submenu = item ? item.querySelector(':scope > .header__drawer-submenu') : null;
      if (!item || !submenu) return;
      var isOpen = item.classList.contains('header__drawer-item--open');
      if (isOpen) {
        closeDrawerItem(item);
      } else {
        item.classList.add('header__drawer-item--open');
        toggle.setAttribute('aria-expanded', 'true');
        submenu.style.maxHeight = submenu.scrollHeight + 'px';
        updateDrawerSubmenuHeight(item.parentElement ? item.parentElement.closest('.header__drawer-item--open') : null);
      }
    });

    // ---- Propagate allow-transparent-header from header to the next opted-in section ----
    // Any section that wants transparent-header support just adds data-transparent-target
    // to its own outer wrapper — no schema setting, no JS changes needed per-section.
    function syncTransparentHeaderSection() {
      document.querySelectorAll('.v-header').forEach(function (headerWrapper) {
        var isEnabled = headerWrapper.dataset.wasTransparent === 'true';

        var sectionWrapper = headerWrapper.closest('.shopify-section') || headerWrapper.parentElement;
        var nextSectionWrapper = sectionWrapper ? sectionWrapper.nextElementSibling : null;

        var target = null;
        if (nextSectionWrapper) {
          target = nextSectionWrapper.matches('[data-transparent-target]')
            ? nextSectionWrapper
            : nextSectionWrapper.querySelector('[data-transparent-target]');
        }

        // If the next section doesn't support transparent header, the header
        // itself shouldn't render transparent either — even if the merchant
        // setting is enabled — since there's nothing suitable underneath it.
        var isActive = isEnabled && !!target;
        headerWrapper.classList.toggle('allow-transparent-header', isActive);
        headerWrapper.dataset.transparentActive = isActive ? 'true' : 'false';

        if (target) {
          target.classList.toggle('allow-transparent-header', isEnabled);
        }
      });
    }
    window.syncTransparentHeaderSection = syncTransparentHeaderSection;

    // ---- Remove allow-transparent-header on hover, restore it on hover-out ----
    function bindTransparentHoverToggle() {
      document.querySelectorAll('.v-header').forEach(function (headerWrapper) {
        // already bound? skip (theme editor re-renders can re-call this)
        if (headerWrapper.dataset.transparentHoverBound === 'true') return;
        headerWrapper.dataset.transparentHoverBound = 'true';

        // remember it was originally transparent-enabled, even after class is removed
        if (headerWrapper.classList.contains('allow-transparent-header')) {
          headerWrapper.dataset.wasTransparent = 'true';
        }

        headerWrapper.addEventListener('mouseenter', function () {
          if (headerWrapper.dataset.transparentActive === 'true') {
            headerWrapper.classList.remove('allow-transparent-header');
          }
        });

        headerWrapper.addEventListener('mouseleave', function () {
          if (headerWrapper.dataset.transparentActive === 'true') {
            headerWrapper.classList.add('allow-transparent-header');
          }
        });
      });

      syncTransparentHeaderSection(); // initial sync on page load
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindTransparentHoverToggle);
    } else {
      bindTransparentHoverToggle();
    }

    // ---- Set --header-height CSS var based on actual rendered header height ----
    function setHeaderHeightVar() {
      document.querySelectorAll('.v-header').forEach(function (headerWrapper) {
        var headerEl = headerWrapper.querySelector('.header');
        if (!headerEl) return;
        var height = headerEl.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', height + 'px');
      });
    }
    window.setHeaderHeightVar = setHeaderHeightVar;

    function bindHeaderHeightObserver() {
      setHeaderHeightVar();

      var resizeTimeout;
      window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(setHeaderHeightVar, 100);
      });

      if (window.ResizeObserver && !window.__headerHeightRO) {
        window.__headerHeightRO = new ResizeObserver(function () {
          setHeaderHeightVar();
        });
        document.querySelectorAll('.v-header .header').forEach(function (headerEl) {
          window.__headerHeightRO.observe(headerEl);
        });
      }

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(setHeaderHeightVar);
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindHeaderHeightObserver);
    } else {
      bindHeaderHeightObserver();
    }


    if (Shopify && Shopify.designMode) {
      document.addEventListener('shopify:section:load', function () {
        forceResetHeaderUI();
        bindTransparentHoverToggle();
        setHeaderHeightVar();
      });

      document.addEventListener('shopify:section:select', function () {
        forceResetHeaderUI();
      });

      document.addEventListener('shopify:section:reorder', function () {
        forceResetHeaderUI();
        syncTransparentHeaderSection();
        setHeaderHeightVar();
      });
    }
  }
