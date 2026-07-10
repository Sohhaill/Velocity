if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const lenis = new Lenis({
    duration: 1.4,
    smoothWheel: true,
    wheelMultiplier: 0.7
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
}