(function () {
  var drawer = null;
  var swiperInstance = null;
  var currentProduct = null;

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
      openDrawer(trigger.dataset.productId, trigger.dataset.variantId);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-active')) {
        closeDrawer();
      }
    });
  }

  function openDrawer(productId, variantId) {
    if (!drawer) return;
    drawer.classList.add('is-active');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('v-drawer-open');
    if (window.lenis) window.lenis.stop();

    showLoader();

    fetchProductById(productId).then(function (product) {
      currentProduct = product;
      renderProduct(product, variantId);
      hideLoader();
    }).catch(function () {
      hideLoader();
    });
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

  // Fetch product JSON. Assumes trigger passes a product handle in data-product-id,
  // OR you can switch data-product-id to store the handle directly.
  function fetchProductById(productHandleOrId) {
    return fetch('/products/' + productHandleOrId + '.js')
      .then(function (res) { return res.json(); });
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
    var wrapper = drawer.querySelector('[data-drawer-media-wrapper]');
    wrapper.innerHTML = '';

    product.images.forEach(function (src) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      var img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
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

    var vendorEl = drawer.querySelector('[data-drawer-vendor]');
    if (product.vendor) {
      vendorEl.textContent = product.vendor;
      vendorEl.hidden = false;
    } else {
      vendorEl.hidden = true;
    }

    drawer.querySelector('[data-drawer-title]').textContent = product.title;

    function normalizeOptionValue(value) {
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') {
        return value.name || value.value || JSON.stringify(value);
      }
      return String(value);
    }

    function isVariantAvailable(v) {
      return v.available || (typeof v.inventory_quantity === 'number' && v.inventory_quantity > 0);
    }

    var selectedVariant = product.variants.find(function (v) {
      return v.id == variantId && isVariantAvailable(v);
    }) || product.variants.find(isVariantAvailable) || product.variants[0];

    var selectedOptions = [
      normalizeOptionValue(selectedVariant.option1),
      normalizeOptionValue(selectedVariant.option2),
      normalizeOptionValue(selectedVariant.option3)
    ];

    function getOptionValue(variant, index) {
      return normalizeOptionValue(
        index === 0 ? variant.option1 : index === 1 ? variant.option2 : index === 2 ? variant.option3 : ''
      );
    }

    function buildSelection(selection) {
      return product.variants.find(function (v) {
        return product.options.every(function (_, index) {
          var value = selection[index];
          return value === undefined || getOptionValue(v, index) === value;
        });
      });
    }

    function getOptionValues(optionIndex, selection) {
      var values = {};
      product.variants.forEach(function (v) {
        var matches = product.options.every(function (_, idx) {
          if (idx >= optionIndex) return true;
          var selectedValue = selection[idx];
          return selectedValue === undefined || getOptionValue(v, idx) === selectedValue;
        });
        if (!matches) return;
        var optionValue = getOptionValue(v, optionIndex);
        if (!optionValue) return;
        if (!values[optionValue]) {
          values[optionValue] = { available: false, hasVariant: false };
        }
        values[optionValue].hasVariant = true;
        if (isVariantAvailable(v)) {
          values[optionValue].available = true;
        }
      });
      return Object.keys(values).sort().map(function (value) {
        return { value: value, available: values[value].available };
      });
    }

    function getMatchingVariant(selection) {
      return product.variants.find(function (v) {
        return product.options.every(function (_, idx) {
          var value = selection[idx];
          return value === undefined || getOptionValue(v, idx) === value;
        }) && isVariantAvailable(v);
      });
    }

    function normalizeSelectionAt(index) {
      for (var i = index + 1; i < product.options.length; i += 1) {
        var values = getOptionValues(i, selectedOptions);
        var selectedValue = values.find(function (item) {
          return item.available;
        });
        selectedOptions[i] = selectedValue ? selectedValue.value : (values[0] ? values[0].value : undefined);
      }
    }

    function updateSelectedVariant() {
      var variant = getMatchingVariant(selectedOptions) || buildSelection(selectedOptions) || selectedVariant;
      selectedVariant = variant;
      drawer.querySelector('[data-drawer-price]').textContent = formatMoney(selectedVariant.price);
    }

    function renderVariantGroups() {
      var variantsWrap = drawer.querySelector('[data-drawer-variants]');
      variantsWrap.innerHTML = '';

      selectedOptions = selectedOptions.slice(0, product.options.length);
      normalizeSelectionAt(-1);
      updateSelectedVariant();

      product.options.forEach(function (optionName, optionIndex) {
        if (!optionName) return;
        var group = document.createElement('div');
        group.className = 'v-drawer__variant-group';

        var label = document.createElement('p');
        label.className = 'v-drawer__variant-label';
        label.textContent = optionName;
        group.appendChild(label);

        var valuesWrap = document.createElement('div');
        valuesWrap.className = 'v-drawer__variant-values';

        var values = getOptionValues(optionIndex, selectedOptions);
        values.forEach(function (item) {
          var valueButton = document.createElement('button');
          valueButton.type = 'button';
          valueButton.className = 'v-drawer__variant-swatch';
          valueButton.textContent = item.value;

          if (selectedOptions[optionIndex] === item.value) {
            valueButton.classList.add('is-selected');
          }
          if (!item.available) {
            valueButton.classList.add('is-out-of-stock');
            valueButton.disabled = true;
          }

          valueButton.addEventListener('click', function () {
            selectedOptions[optionIndex] = item.value;
            normalizeSelectionAt(optionIndex);
            updateSelectedVariant();
            renderVariantGroups();
          });

          valuesWrap.appendChild(valueButton);
        });

        group.appendChild(valuesWrap);
        variantsWrap.appendChild(group);
      });
    }

    renderVariantGroups();
  }

  document.addEventListener('DOMContentLoaded', initDrawer);
  if (document.readyState !== 'loading') initDrawer();
})();