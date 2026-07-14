if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.lenis = new Lenis({
    duration: 1,
    smoothWheel: true,
  
  });

  function raf(time) {
    window.lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}