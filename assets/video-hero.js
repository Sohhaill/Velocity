document.addEventListener('DOMContentLoaded', initVideoHero);
if (document.readyState !== 'loading') initVideoHero();

function initVideoHero() {
  document.querySelectorAll('[data-v-video-hero]').forEach(function(root) {
    if (root.__vVideoInit) return;
    root.__vVideoInit = true;

    var videos = root.querySelectorAll('.v-video__video');
    var playBtn = root.querySelector('.v-video__play-btn');
    var muteBtn = root.querySelector('.v-video__mute-btn');
    var autoplay = root.dataset.autoplay === 'true';

    videos.forEach(function(v) {
      v.muted = true;
      v.playsInline = true;
    });

    if (autoplay) {
      root.classList.add('is-playing');
    }

    playBtn.addEventListener('click', function() {
      var isPlaying = root.classList.contains('is-playing');
      videos.forEach(function(v) {
        if (isPlaying) {
          v.pause();
        } else {
          v.play().catch(function() {});
        }
      });
      root.classList.toggle('is-playing', !isPlaying);
    });

    muteBtn.addEventListener('click', function() {
      var isUnmuted = root.classList.contains('is-unmuted');
      videos.forEach(function(v) {
        v.muted = isUnmuted;
      });
      root.classList.toggle('is-unmuted', !isUnmuted);
    });
  });

  document.addEventListener('shopify:section:load', function(e) {
    var root = e.target.querySelector('[data-v-video-hero]');
    if (root) initVideoHero();
  });
}