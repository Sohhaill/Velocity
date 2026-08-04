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

    var selectedVariant = product.variants.find(function (v) {
      return v.id == variantId && v.available;
    }) || product.variants.find(function (v) {
      return v.available;
    }) || product.variants[0];

    drawer.querySelector('[data-drawer-price]').textContent = formatMoney(selectedVariant.price);

    var variantsWrap = drawer.querySelector('[data-drawer-variants]');
    variantsWrap.innerHTML = '';

    product.variants.forEach(function (v) {
      var swatch = document.createElement('span');
      swatch.className = 'v-drawer__variant-swatch';
      swatch.dataset.variantId = v.id;

      if (v.id == selectedVariant.id) {
        swatch.classList.add('is-selected');
      }
      if (!v.available) {
        swatch.classList.add('is-out-of-stock');
      }

      var labelParts = [];
      if (v.option1) labelParts.push(v.option1);
      if (v.option2) labelParts.push(v.option2);
      if (v.option3) labelParts.push(v.option3);
      var label = labelParts.join(' / ') || v.title;

      if (v.featured_image) {
        var img = document.createElement('img');
        img.src = v.featured_image.src;
        img.alt = label;
        swatch.appendChild(img);
      } else {
        swatch.textContent = label;
      }

      swatch.addEventListener('click', function () {
        if (!v.available) return;
        variantsWrap.querySelectorAll('.v-drawer__variant-swatch').forEach(function (s) {
          s.classList.remove('is-selected');
        });
        swatch.classList.add('is-selected');
        drawer.querySelector('[data-drawer-price]').textContent = formatMoney(v.price);
      });

      variantsWrap.appendChild(swatch);
    });
  }

  document.addEventListener('DOMContentLoaded', initDrawer);
  if (document.readyState !== 'loading') initDrawer();
})();