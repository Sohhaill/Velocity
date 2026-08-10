(function () {
  var drawer = null;
  var swiperInstance = null;

  function initDrawer() {
    drawer = document.querySelector('[data-quick-view-drawer]');
    if (!drawer) return;

    drawer.querySelectorAll('[data-drawer-close]').forEach(function (btn) {
      btn.addEventListener('click', closeDrawer);
    });

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-quick-view-open]');
      if (!trigger) return;
      e.preventDefault();

      var card = trigger.closest('[data-v-product-card]');
      var jsonEl = card ? card.querySelector('[data-product-json]') : null;
      if (!jsonEl) return;

      var product;
      try {
        product = JSON.parse(jsonEl.textContent);
      } catch (err) {
        return;
      }

      openDrawer(product, trigger.dataset.variantId);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-active')) {
        closeDrawer();
      }
    });
  }

  function openDrawer(product, variantId) {
    if (!drawer) return;
    drawer.classList.add('is-active');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('v-drawer-open');
    if (window.lenis) window.lenis.stop();

    showLoader();

    // Safety timeout so the loader never hangs forever if an image fails silently
    var safetyTimer = setTimeout(finish, 1500);
    var finished = false;

    function finish() {
      if (finished) return;
      finished = true;
      clearTimeout(safetyTimer);
      renderProduct(product, variantId);
      hideLoader();
    }

    preloadImages(product.images).then(finish).catch(finish);
  }

  function preloadImages(urls) {
    if (!urls || !urls.length) return Promise.resolve();
    return Promise.all(
      urls.map(function (src) {
        return new Promise(function (resolve) {
          var img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = src;
        });
      })
    );
  }

  function showLoader() {
    var loader = drawer.querySelector('[data-drawer-loader]');
    var body = drawer.querySelector('[data-drawer-body]');
    if (loader) loader.classList.add('is-visible');
    if (body) body.classList.add('is-loading');
  }

  function hideLoader() {
    var loader = drawer.querySelector('[data-drawer-loader]');
    var body = drawer.querySelector('[data-drawer-body]');
    if (loader) loader.classList.remove('is-visible');
    if (body) body.classList.remove('is-loading');
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-active');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('v-drawer-open');
    if (window.lenis) window.lenis.start();
  }

  function formatMoney(cents) {
    var amount = cents / 100;
    var formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
    return 'Rs.' + formatted;
  }

  function renderProduct(product, variantId) {
    // MEDIA
    var wrapper = drawer.querySelector('[data-drawer-media-wrapper]');
    wrapper.innerHTML = '';

    (product.images || []).forEach(function (src) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      var img = document.createElement('img');
      img.src = src;
      slide.appendChild(img);
      wrapper.appendChild(slide);
    });

    if (swiperInstance) swiperInstance.destroy(true, true);
    swiperInstance = new Swiper(drawer.querySelector('[data-drawer-swiper]'), {
      pagination: { el: drawer.querySelector('[data-drawer-pagination]'), clickable: true },
      navigation: {
        prevEl: drawer.querySelector('[data-drawer-prev]'),
        nextEl: drawer.querySelector('[data-drawer-next]')
      }
    });

    // VENDOR / TITLE
    var vendorEl = drawer.querySelector('[data-drawer-vendor]');
    if (product.vendor) {
      vendorEl.textContent = product.vendor;
      vendorEl.hidden = false;
    } else {
      vendorEl.hidden = true;
    }
    drawer.querySelector('[data-drawer-title]').textContent = product.title;

    // VARIANT LOGIC
    var options = product.options || [];
    var variants = product.variants || [];

    function optionValue(variant, index) {
      return index === 0 ? variant.option1 : index === 1 ? variant.option2 : variant.option3;
    }

    var initial = variants.find(function (v) { return v.id == variantId && v.available; })
      || variants.find(function (v) { return v.available; })
      || variants[0];

    var selected = options.map(function (_, i) { return optionValue(initial, i); });

    function findVariant(selection) {
      return variants.find(function (v) {
        return options.every(function (_, i) {
          return optionValue(v, i) === selection[i];
        });
      });
    }

    function isAvailableGivenPriorSelections(optionIndex, value) {
      var testSelection = selected.slice(0, optionIndex).concat([value]);
      return variants.some(function (v) {
        for (var i = 0; i < testSelection.length; i++) {
          if (optionValue(v, i) !== testSelection[i]) return false;
        }
        return v.available;
      });
    }

    function getValuesForOption(optionIndex) {
      var seen = {};
      var list = [];
      variants.forEach(function (v) {
        for (var i = 0; i < optionIndex; i++) {
          if (optionValue(v, i) !== selected[i]) return;
        }
        var value = optionValue(v, optionIndex);
        if (!value || seen[value]) return;
        seen[value] = true;
        list.push(value);
      });
      return list.map(function (value) {
        return { value: value, available: isAvailableGivenPriorSelections(optionIndex, value) };
      });
    }

    function updatePrice() {
      var variant = findVariant(selected) || initial;
      drawer.querySelector('[data-drawer-price]').textContent = formatMoney(variant.price);
    }

    function render() {
      var variantsWrap = drawer.querySelector('[data-drawer-variants]');
      variantsWrap.innerHTML = '';

      options.forEach(function (optionName, optionIndex) {
        var group = document.createElement('div');
        group.className = 'v-drawer__variant-group';

        var label = document.createElement('p');
        label.className = 'v-drawer__variant-label';
        label.textContent = optionName;
        group.appendChild(label);

        var valuesWrap = document.createElement('div');
        valuesWrap.className = 'v-drawer__variant-values';

        getValuesForOption(optionIndex).forEach(function (item) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'v-drawer__variant-swatch';
          btn.textContent = item.value;

          if (selected[optionIndex] === item.value) {
            btn.classList.add('is-selected');
          }
          if (!item.available) {
            btn.classList.add('is-out-of-stock');
          }

          btn.addEventListener('click', function () {
            selected[optionIndex] = item.value;
            // reset options after this one so they re-derive valid combinations
            for (var i = optionIndex + 1; i < options.length; i++) {
              var validValues = getValuesForOption(i);
              var stillValid = validValues.find(function (v) { return v.value === selected[i] && v.available; });
              selected[i] = stillValid ? stillValid.value : (validValues[0] ? validValues[0].value : selected[i]);
            }
            updatePrice();
            render();
          });

          valuesWrap.appendChild(btn);
        });

        group.appendChild(valuesWrap);
        variantsWrap.appendChild(group);
      });
    }

    updatePrice();
    render();
  }

  document.addEventListener('DOMContentLoaded', initDrawer);
  if (document.readyState !== 'loading') initDrawer();
})();