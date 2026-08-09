(function () {
  const root = document.documentElement;
  const baseWidth = 1440;
  const minWidth = 1441;
  const minHeight = 820;
  const maxScale = 1.8;
  let resizeFrame = null;

  function updateViewportScale() {
    const isLargeDesktop = window.innerWidth >= minWidth && window.innerHeight >= minHeight;
    root.classList.toggle('is-large-desktop', isLargeDesktop);

    if (!isLargeDesktop) {
      root.style.setProperty('--desktop-scale', '1');
      return;
    }

    const nextScale = Math.max(1, Math.min(window.innerWidth / baseWidth, maxScale));
    root.style.setProperty('--desktop-scale', nextScale.toFixed(4));
  }

  window.addEventListener('resize', () => {
    if (resizeFrame) cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      updateViewportScale();
      resizeFrame = null;
    });
  });

  updateViewportScale();
})();
