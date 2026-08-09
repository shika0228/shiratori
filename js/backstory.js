const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');
const menuBackdrop = document.getElementById('menu-backdrop');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
    menuBackdrop?.classList.toggle('active');
  });
}

const hourglassWrapper = document.querySelector('.hourglass-wrapper');

if (hourglassWrapper) {
  const hoverPairs = [
    {
      className: 'is-witch-hover',
      elements: [
        hourglassWrapper.querySelector('.hourglass-link-top'),
        hourglassWrapper.querySelector('.btn-witch'),
      ],
    },
    {
      className: 'is-pokemon-hover',
      elements: [
        hourglassWrapper.querySelector('.hourglass-link-bottom'),
        hourglassWrapper.querySelector('.btn-pokemon'),
      ],
    },
  ];

  hoverPairs.forEach(({ className, elements }) => {
    elements.filter(Boolean).forEach((element) => {
      element.addEventListener('mouseenter', () => {
        hourglassWrapper.classList.add(className);
      });
      element.addEventListener('mouseleave', () => {
        hourglassWrapper.classList.remove(className);
      });
      element.addEventListener('focus', () => {
        hourglassWrapper.classList.add(className);
      });
      element.addEventListener('blur', () => {
        hourglassWrapper.classList.remove(className);
      });
    });
  });
}

const storySection = document.querySelector('.background-story');
const revealItems = Array.from(document.querySelectorAll('.background-story__reveal'));

if (storySection) {
  let storyFrame = null;

  const updateStoryDim = () => {
    const rect = storySection.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const start = viewportHeight;
    const end = -rect.height + viewportHeight * 0.92;
    const rawProgress = Math.max(0, Math.min(1, (start - rect.top) / (start - end)));
    const easedProgress = Math.pow(rawProgress, 0.72);
    const progress = rawProgress > 0 ? Math.min(1, 0.09 + easedProgress * 0.91) : 0;

    storySection.style.setProperty('--story-dim', progress.toFixed(3));
    storyFrame = null;
  };

  const requestStoryDimUpdate = () => {
    if (storyFrame) return;
    storyFrame = requestAnimationFrame(updateStoryDim);
  };

  storySection.addEventListener('pointermove', () => {
    storySection.classList.add('is-pointer-active');
  });

  storySection.addEventListener('pointerleave', () => {
    storySection.classList.remove('is-pointer-active');
  });

  window.addEventListener('scroll', requestStoryDimUpdate, { passive: true });
  window.addEventListener('resize', requestStoryDimUpdate);
  updateStoryDim();
}

if (revealItems.length) {
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, {
      root: null,
      rootMargin: '0px 0px -14% 0px',
      threshold: 0.16,
    });

    revealItems.forEach((item) => {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => {
      item.classList.add('is-visible');
    });
  }
}
