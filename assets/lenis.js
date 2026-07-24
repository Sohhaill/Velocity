if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.lenis = new Lenis({
    duration: 1,
    smoothWheel: true,
    prevent: (node) => {
      // auto-skip Lenis on ANY element that scrolls internally
      const style = getComputedStyle(node);
      const scrollable = (style.overflowY === 'auto' || style.overflowY === 'scroll')
        && node.scrollHeight > node.clientHeight;
      return scrollable || node.closest('[data-lenis-prevent]') !== null;
    },
  });

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}