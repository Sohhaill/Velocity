document.addEventListener('DOMContentLoaded', initMediaGrid);
if (document.readyState !== 'loading') initMediaGrid();

function initMediaGrid() {
  document.querySelectorAll('[data-v-mediagrid]').forEach(function(root) {
    if (root.__vMediaGridInit) return;
    root.__vMediaGridInit = true;

    var videos = root.querySelectorAll('.v-mediagrid__video');
    videos.forEach(function(v) {
      v.muted = true;
      v.playsInline = true;
      v.play().catch(function() {});
    });
  });

  document.addEventListener('shopify:section:load', function(e) {
    var root = e.target.querySelector('[data-v-mediagrid]');
    if (root) initMediaGrid();
  });
}