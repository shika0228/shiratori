const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

if (hamburger && menu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    menu.classList.toggle('active');
  });
}

const navItems = Array.from(document.querySelectorAll('.nav-item'));
const visualItems = Array.from(document.querySelectorAll('.visual-item'));
const infoItems = Array.from(document.querySelectorAll('.info-item'));
const eachButtonsContainer = document.getElementById('stage-nav-for-each-buttons');

const VISUAL_ID_PATTERN = /^visual-item-(\d+)(?:-(\d+))?$/;
const LARGE_DESKTOP_BASE_WIDTH = 1440;
const LARGE_DESKTOP_BASE_HEIGHT = 900;
const LARGE_DESKTOP_MIN_WIDTH = 1441;
const LARGE_DESKTOP_MIN_HEIGHT = 820;
const LARGE_DESKTOP_MAX_SCALE = 1.45;

function parseVisualId(visualId) {
  const match = visualId.match(VISUAL_ID_PATTERN);
  if (!match) return null;

  return {
    characterIndex: Number(match[1]),
    variantIndex: match[2] ? Number(match[2]) : 1
  };
}

/*
  GitHub Pages 上注意：
  这里的 backgroundImage 是写进 HTML 元素的 style 里，
  所以路径要以当前页面 character.html 为基准，
  不是以 js/character.js 为基准。
*/
function getClickImageByVisualId(visualId) {
  return `url('img_character/${visualId.replace('visual-item', 'click')}.png')`;
}

function getFrameImageByVisualId(visualId) {
  return `url('img_character/${visualId.replace('visual-item', 'bg-frame')}.png')`;
}

function buildNavConfigFromVisuals() {
  const config = {};

  visualItems.forEach((visualItem) => {
    const parsed = parseVisualId(visualItem.id);
    if (!parsed) return;

    const navId = `nav-item-${parsed.characterIndex}`;
    const infoId = `info-item-${parsed.characterIndex}`;

    if (!config[navId]) {
      config[navId] = {
        infoId,
        outfits: []
      };
    }

    config[navId].outfits.push({
      id: `each-item-${parsed.characterIndex}-${parsed.variantIndex}`,
      visualId: visualItem.id,
      background: getClickImageByVisualId(visualItem.id),
      characterIndex: parsed.characterIndex,
      variantIndex: parsed.variantIndex
    });
  });

  Object.values(config).forEach((navState) => {
    navState.outfits.sort((a, b) => a.variantIndex - b.variantIndex);
  });

  return config;
}

const navConfig = buildNavConfigFromVisuals();

function applyVisualFrameBackgrounds() {
  visualItems.forEach((visualItem) => {
    visualItem.style.backgroundImage = getFrameImageByVisualId(visualItem.id);
  });
}

function getVisualItemById(id) {
  return visualItems.find((item) => item.id === id) || null;
}

function restartVisualAnimation(visualItem) {
  if (!visualItem) return;

  const visualMain = visualItem.querySelector('.visual-item-main');
  if (!visualMain) return;

  visualMain.classList.remove('is-entering');
  void visualMain.offsetWidth;
  visualMain.classList.add('is-entering');
}

function setActiveVisual(visualId) {
  const activeVisual = getVisualItemById(visualId);

  visualItems.forEach((visualItem) => {
    visualItem.classList.toggle('is-active', visualItem.id === visualId);
  });

  restartVisualAnimation(activeVisual);
}

function setActiveInfo(infoId) {
  infoItems.forEach((infoItem) => {
    infoItem.classList.toggle('is-active', infoItem.id === infoId);
  });
}

function setActiveNav(navId) {
  navItems.forEach((navItem) => {
    const isActive = navItem.id === navId;
    navItem.classList.toggle('is-active', isActive);
    navItem.setAttribute('aria-pressed', String(isActive));
  });
}

function setActiveEach(eachId) {
  const eachItems = Array.from(document.querySelectorAll('.stage-nav-for-each-item'));

  eachItems.forEach((eachItem) => {
    const isActive = eachItem.id === eachId;
    eachItem.classList.toggle('is-active', isActive);
    eachItem.setAttribute('aria-pressed', String(isActive));
  });
}

function renderEachButtons(navId) {
  if (!eachButtonsContainer) return;

  const navState = navConfig[navId];
  eachButtonsContainer.innerHTML = '';

  if (!navState || !navState.outfits.length) return;

  navState.outfits.forEach((outfit, index) => {
    const button = document.createElement('button');
    button.className = 'stage-nav-for-each-item';
    button.id = outfit.id;
    button.type = 'button';
    button.dataset.visualId = outfit.visualId;
    button.dataset.navId = navId;
    button.style.backgroundImage = outfit.background;
    button.setAttribute('aria-label', `切换服装 ${outfit.variantIndex}`);
    button.setAttribute('aria-pressed', String(index === 0));

    button.addEventListener('click', () => {
      switchByEach(navId, outfit.id);
    });

    eachButtonsContainer.appendChild(button);
  });
}

function switchByNav(navId) {
  const navState = navConfig[navId];
  if (!navState || !navState.outfits.length) return;

  const defaultOutfit = navState.outfits[0];

  setActiveNav(navId);
  setActiveInfo(navState.infoId);
  renderEachButtons(navId);
  setActiveEach(defaultOutfit.id);
  setActiveVisual(defaultOutfit.visualId);
}

function switchByEach(navId, eachId) {
  const navState = navConfig[navId];
  if (!navState) return;

  const outfit = navState.outfits.find((item) => item.id === eachId);
  if (!outfit) return;

  setActiveNav(navId);
  setActiveInfo(navState.infoId);
  setActiveEach(eachId);
  setActiveVisual(outfit.visualId);
}

function getInitialNavId() {
  const activeNav = navItems.find((navItem) => navItem.classList.contains('is-active'));
  if (activeNav && navConfig[activeNav.id]) return activeNav.id;

  const fallbackNav = navItems.find((navItem) => navConfig[navItem.id]?.outfits?.length);
  return fallbackNav ? fallbackNav.id : null;
}

function updateDesktopScale() {
  const html = document.documentElement;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const isLargeDesktop = viewportWidth >= LARGE_DESKTOP_MIN_WIDTH && viewportHeight >= LARGE_DESKTOP_MIN_HEIGHT;
  html.classList.toggle('is-large-desktop', isLargeDesktop);

  if (!isLargeDesktop) {
    html.style.setProperty('--desktop-scale', '1');
    return;
  }

  const widthScale = viewportWidth / LARGE_DESKTOP_BASE_WIDTH;
  const heightScale = viewportHeight / LARGE_DESKTOP_BASE_HEIGHT;
  const nextScale = Math.max(1, Math.min(widthScale, heightScale, LARGE_DESKTOP_MAX_SCALE));

  html.style.setProperty('--desktop-scale', nextScale.toFixed(4));
}

let resizeFrame = null;

window.addEventListener('resize', () => {
  if (resizeFrame) cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    updateDesktopScale();
    resizeFrame = null;
  });
});

applyVisualFrameBackgrounds();

navItems.forEach((navItem) => {
  navItem.addEventListener('click', () => {
    switchByNav(navItem.id);
  });
});

const initialNavId = getInitialNavId();

if (initialNavId) {
  switchByNav(initialNavId);
}

updateDesktopScale();