/* ==========================================
   1. 汉堡菜单逻辑
   ========================================== */
const hamburger = document.getElementById('hamburger');
const menu = document.getElementById('menu');

if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        menu.classList.toggle('active');
    });
}

/* ==========================================
   1.5 section-nav 离开视框后固定 + 滚动方向显隐
   ========================================== */
(function initSectionNavScrollBehavior() {
    const sectionNav = document.querySelector('.section-nav');

    if (!sectionNav) return;

    const HIDE_SCROLL_DELTA = 10;
    const SHOW_SCROLL_DELTA = 4;

    let navOriginalBottom = 0;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let ticking = false;

    function getScrollY() {
        return Math.max(window.scrollY || window.pageYOffset || 0, 0);
    }

    function measureSectionNavPosition() {
        const wasFixed = sectionNav.classList.contains('is-fixed');
        const wasHidden = sectionNav.classList.contains('is-hidden');

        if (wasFixed) {
            sectionNav.classList.remove('is-fixed', 'is-hidden');
        }

        const rect = sectionNav.getBoundingClientRect();
        navOriginalBottom = rect.top + getScrollY() + rect.height;

        if (wasFixed) {
            sectionNav.classList.add('is-fixed');

            if (wasHidden) {
                sectionNav.classList.add('is-hidden');
            }
        }
    }

    function updateSectionNavState() {
        const currentScrollY = getScrollY();
        const scrollDelta = currentScrollY - lastScrollY;
        const shouldBeFixed = currentScrollY >= navOriginalBottom;

        if (!shouldBeFixed) {
            sectionNav.classList.remove('is-fixed', 'is-hidden');
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        const justBecameFixed = !sectionNav.classList.contains('is-fixed');

        if (justBecameFixed) {
            sectionNav.classList.add('is-fixed');
            sectionNav.classList.remove('is-hidden');
            lastScrollY = currentScrollY;
            ticking = false;
            return;
        }

        if (scrollDelta > HIDE_SCROLL_DELTA) {
            sectionNav.classList.add('is-hidden');
        } else if (scrollDelta < -SHOW_SCROLL_DELTA) {
            sectionNav.classList.remove('is-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function requestSectionNavUpdate() {
        if (ticking) return;

        ticking = true;
        window.requestAnimationFrame(updateSectionNavState);
    }

    window.addEventListener('scroll', requestSectionNavUpdate, { passive: true });
    window.addEventListener('resize', () => {
        measureSectionNavPosition();
        requestSectionNavUpdate();
    });
    window.addEventListener('load', () => {
        measureSectionNavPosition();
        requestSectionNavUpdate();
    });

    measureSectionNavPosition();
    requestSectionNavUpdate();
})();

/* ==========================================
   2. profile-img 左侧淡入
   ========================================== */
const profileImg = document.querySelector('.profile-img');

if (profileImg) {
    if ('IntersectionObserver' in window) {
        const profileObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        profileImg.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.25,
            }
        );

        profileObserver.observe(profileImg);
    } else {
        window.addEventListener('load', () => {
            profileImg.classList.add('is-visible');
        });
    }
}

/* ==========================================
   3. Pokemon Team 切换逻辑
   ========================================== */
const ballButtons = document.querySelectorAll('.ball-btn');
const teamImage = document.getElementById('pokemon-team-image');

const pokemonImageMap = {
    1: 'img_poketrainer/pokemon_1.svg',
    2: 'img_poketrainer/pokemon_2.svg',
    3: 'img_poketrainer/pokemon_3.svg',
    4: 'img_poketrainer/pokemon_4.svg',
    5: 'img_poketrainer/pokemon_5.svg',
    6: 'img_poketrainer/pokemon_6.svg',
};

function switchPokemon(pokemonId) {
    if (!teamImage || !pokemonImageMap[pokemonId]) return;

    const nextSrc = pokemonImageMap[pokemonId];

    ballButtons.forEach((button) => {
        button.classList.toggle('is-active', button.dataset.pokemon === String(pokemonId));
    });

    teamImage.classList.remove('is-changing');
    void teamImage.offsetWidth;

    teamImage.src = nextSrc;
    teamImage.alt = `宝可梦 ${pokemonId}`;
    teamImage.classList.add('is-changing');
}

ballButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const pokemonId = Number(button.dataset.pokemon);
        switchPokemon(pokemonId);
    });
});

/* ==========================================
   4. 服设轮播逻辑
   说明：把下面 8 个 src 改成你的真实图片路径即可。
   图片尺寸按 386 × 471 设计。
   自动轮播方向为“从左往右流动”，每 2.5 秒切换一张。
   ========================================== */
const costumeCarousel = document.querySelector('[data-costume-carousel]');

if (costumeCarousel) {
    const carouselStage = costumeCarousel.querySelector('#costume-carousel-stage');
    const prevButton = costumeCarousel.querySelector('.costume-carousel__nav--prev');
    const nextButton = costumeCarousel.querySelector('.costume-carousel__nav--next');
    const statusText = costumeCarousel.querySelector('.costume-carousel__status');

    const costumeImages = [
        { src: 'img_poketrainer/costume_1.png', alt: '服设展示 1' },
        { src: 'img_poketrainer/costume_2.png', alt: '服设展示 2' },
        { src: 'img_poketrainer/costume_3.png', alt: '服设展示 3' },
        { src: 'img_poketrainer/costume_4.png', alt: '服设展示 4' },
        { src: 'img_poketrainer/costume_5.png', alt: '服设展示 5' },
        { src: 'img_poketrainer/costume_6.png', alt: '服设展示 6' },
        { src: 'img_poketrainer/costume_7.png', alt: '服设展示 7' },
        { src: 'img_poketrainer/costume_8.png', alt: '服设展示 8' },
    ];

    const AUTO_DELAY = 2500;
    let activeIndex = 0;
    let autoTimer = null;

    function getCostumeCardWidth(viewportWidth) {
        /*
         * 宽度来源与 CSS 保持一致：
         * PC：--card-width: calc(296vw / 14.4)
         * SP：--card-width: calc(327.81vw / 6.0)
         * JS 不再把 --card-width / --card-height 改写成 px，只用这个数值计算卡片间距。
         */
        if (viewportWidth <= 600) {
            return viewportWidth * (327.81 / 600);
        }

        return viewportWidth * (296 / 1440);
    }

    function updateCarouselMetrics() {
        const viewportWidth = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);

        const centerScale = viewportWidth <= 600 ? 1.14 : viewportWidth <= 900 ? 1.2 : 1.45;
        const nearScale = viewportWidth <= 600 ? 0.86 : viewportWidth <= 900 ? 0.88 : 0.9;
        const farScale = viewportWidth <= 600 ? 0.72 : viewportWidth <= 900 ? 0.76 : 0.78;

        const gapNear = viewportWidth <= 600 ? 8 : viewportWidth <= 900 ? 12 : 2;
        const gapFar = viewportWidth <= 600 ? 8 : viewportWidth <= 900 ? 14 : 4;
        const edgeGap = viewportWidth <= 600 ? 10 : viewportWidth <= 900 ? 8 : 0;

        const cardWidth = getCostumeCardWidth(viewportWidth);
        const centerWidth = cardWidth * centerScale;
        const nearWidth = cardWidth * nearScale;
        const farWidth = cardWidth * farScale;

        const offsetNear = (centerWidth + nearWidth) / 2 + gapNear;
        let offsetFar = viewportWidth / 2 - farWidth / 2 - edgeGap;
        const minOffsetFar = offsetNear + (nearWidth + farWidth) / 2 + gapFar;

        if (offsetFar < minOffsetFar) {
            offsetFar = minOffsetFar;
        }

        const hiddenOffset = offsetFar + farWidth * 0.95;

        costumeCarousel.style.setProperty('--center-scale', String(centerScale));
        costumeCarousel.style.setProperty('--near-scale', String(nearScale));
        costumeCarousel.style.setProperty('--far-scale', String(farScale));
        costumeCarousel.style.setProperty('--offset-near', `${offsetNear}px`);
        costumeCarousel.style.setProperty('--offset-far', `${offsetFar}px`);
        costumeCarousel.style.setProperty('--offset-hidden', `${hiddenOffset}px`);
    }

    const cards = costumeImages.map((item, index) => {
        const card = document.createElement('figure');
        card.className = 'costume-card';
        card.dataset.index = String(index);

        const image = document.createElement('img');
        image.src = item.src;
        image.alt = item.alt;
        image.loading = index < 4 ? 'eager' : 'lazy';
        image.decoding = 'async';

        card.appendChild(image);
        carouselStage.appendChild(card);
        return card;
    });

    function getRelativeDistance(index) {
        let distance = index - activeIndex;
        const total = costumeImages.length;

        if (distance > total / 2) {
            distance -= total;
        }

        if (distance < -total / 2) {
            distance += total;
        }

        return distance;
    }

    function setCardState(card, relativeDistance) {
        card.className = 'costume-card';

        if (relativeDistance === 0) {
            card.classList.add('is-center');
            card.setAttribute('aria-hidden', 'false');
            return;
        }

        card.setAttribute('aria-hidden', 'true');

        if (relativeDistance === -1) {
            card.classList.add('is-left-1');
            return;
        }

        if (relativeDistance === 1) {
            card.classList.add('is-right-1');
            return;
        }

        if (relativeDistance === -2) {
            card.classList.add('is-left-2');
            return;
        }

        if (relativeDistance === 2) {
            card.classList.add('is-right-2');
            return;
        }

        if (relativeDistance < 0) {
            card.classList.add('is-hidden-left');
            return;
        }

        card.classList.add('is-hidden-right');
    }

    function renderCarousel() {
        cards.forEach((card, index) => {
            const relativeDistance = getRelativeDistance(index);
            setCardState(card, relativeDistance);
        });

        if (statusText) {
            statusText.textContent = `当前展示第 ${activeIndex + 1} 张，共 ${costumeImages.length} 张。`;
        }
    }

    function goTo(targetIndex, shouldRestartTimer = false) {
        const total = costumeImages.length;
        activeIndex = (targetIndex + total) % total;
        renderCarousel();

        if (shouldRestartTimer) {
            restartAutoplay();
        }
    }

    function stopAutoplay() {
        if (!autoTimer) return;
        window.clearInterval(autoTimer);
        autoTimer = null;
    }

    function startAutoplay() {
        stopAutoplay();
        autoTimer = window.setInterval(() => {
            goTo(activeIndex - 1, false);
        }, AUTO_DELAY);
    }

    function restartAutoplay() {
        startAutoplay();
    }

    prevButton?.addEventListener('click', () => {
        goTo(activeIndex - 1, true);
    });

    nextButton?.addEventListener('click', () => {
        goTo(activeIndex + 1, true);
    });

    costumeCarousel.addEventListener('mouseenter', stopAutoplay);
    costumeCarousel.addEventListener('mouseleave', startAutoplay);
    costumeCarousel.addEventListener('focusin', stopAutoplay);
    costumeCarousel.addEventListener('focusout', startAutoplay);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopAutoplay();
        } else {
            startAutoplay();
        }
    });

    updateCarouselMetrics();
    renderCarousel();
    startAutoplay();

    window.addEventListener('resize', updateCarouselMetrics);
}



/* ==========================================
   5. Background story-wrapper 进入视框 fadeUp
   ========================================== */
(function initStoryWrapperFadeUp() {
    const storyWrappers = document.querySelectorAll('.story-wrapper');

    if (!storyWrappers.length) return;

    function showStoryWrapper(element) {
        element.classList.add('is-visible');
    }

    if ('IntersectionObserver' in window) {
        const storyObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        showStoryWrapper(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.18,
                rootMargin: '0px 0px -8% 0px',
            }
        );

        storyWrappers.forEach((storyWrapper) => {
            storyObserver.observe(storyWrapper);
        });
    } else {
        window.addEventListener('load', () => {
            storyWrappers.forEach(showStoryWrapper);
        });
    }
})();

/* ==========================================
   6. Hisui 区域进入视框动画
   ========================================== */
const hisuiTitle = document.querySelector('.hisui-title');
const hisuiProfileWrapper = document.querySelector('.hisui-profile-wrapper');
const hisuiProfileImg = document.querySelector('.hisui-profile-img');
const hisuiProfileText = document.querySelector('.hisui-profile-text');
const hisuiShark = document.querySelector('.hisui-shark');

function showHisuiElement(element) {
    if (!element) return;
    element.classList.add('is-visible');
}

if (hisuiTitle || hisuiProfileWrapper) {
    if ('IntersectionObserver' in window) {
        if (hisuiTitle) {
            const hisuiTitleObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            showHisuiElement(hisuiTitle);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.2,
                    rootMargin: '0px 0px -8% 0px',
                }
            );

            hisuiTitleObserver.observe(hisuiTitle);
        }

        if (hisuiProfileWrapper) {
            const hisuiProfileObserver = new IntersectionObserver(
                (entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            showHisuiElement(hisuiProfileImg);
                            showHisuiElement(hisuiProfileText);
                            showHisuiElement(hisuiShark);
                            observer.unobserve(entry.target);
                        }
                    });
                },
                {
                    threshold: 0.28,
                    rootMargin: '0px 0px -10% 0px',
                }
            );

            hisuiProfileObserver.observe(hisuiProfileWrapper);
        }
    } else {
        window.addEventListener('load', () => {
            showHisuiElement(hisuiTitle);
            showHisuiElement(hisuiProfileImg);
            showHisuiElement(hisuiProfileText);
            showHisuiElement(hisuiShark);
        });
    }
}

/* ==========================================
   7. Background 故事线：自动连接 background-title + story-img + continue-wrapper
   说明：
   - 虚线从 background-title 下边缘往下 30px 的位置开始。
   - 虚线到 continue-wrapper 上边缘往上 30px 的位置结束。
   - 中间仍然连接每个 story-img 的中心点。
   - 小球图片后期只需要替换 STORYLINE_ORB_SRC 的路径，或直接替换 img_poketrainer/story-orb.svg 文件。
   ========================================== */
(function initBackgroundStoryline() {
    const storylineRoot = document.querySelector('.background');
    if (!storylineRoot) return;

    const STORYLINE_ORB_SRC = 'img_poketrainer/story-orb.svg';
    const STORYLINE_ENDPOINT_GAP = 30;
    const desktopQuery = window.matchMedia('(min-width: 901px)');

    const svgNS = 'http://www.w3.org/2000/svg';
    const storylineSvg = document.createElementNS(svgNS, 'svg');
    const storylinePath = document.createElementNS(svgNS, 'path');
    const storylineOrb = document.createElement('img');

    let pathLength = 0;
    let ticking = false;
    let resizeTicking = false;

    storylineSvg.classList.add('background-storyline');
    storylineSvg.setAttribute('aria-hidden', 'true');
    storylineSvg.setAttribute('focusable', 'false');

    storylinePath.classList.add('background-storyline__path');
    storylineSvg.appendChild(storylinePath);

    storylineOrb.className = 'background-storyline__orb';
    storylineOrb.src = STORYLINE_ORB_SRC;
    storylineOrb.alt = '';
    storylineOrb.setAttribute('aria-hidden', 'true');

    storylineRoot.prepend(storylineSvg);
    storylineRoot.appendChild(storylineOrb);

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function getStorylineTargets() {
        const titleTarget = storylineRoot.querySelector('.background-title');
        const storyImages = Array.from(storylineRoot.querySelectorAll('.story-img'));
        const continueTarget = storylineRoot.querySelector('.continue-wrapper');
        return [titleTarget, ...storyImages, continueTarget].filter(Boolean);
    }

    function getCenterPoint(element, baseRect) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left - baseRect.left + rect.width / 2,
            y: rect.top - baseRect.top + rect.height / 2,
        };
    }

    function getTitleExitPoint(element, baseRect, gap = STORYLINE_ENDPOINT_GAP) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left - baseRect.left + rect.width / 2,
            y: rect.bottom - baseRect.top + gap,
        };
    }

    function getContinueEntryPoint(element, baseRect, gap = STORYLINE_ENDPOINT_GAP) {
        const rect = element.getBoundingClientRect();
        return {
            x: rect.left - baseRect.left + rect.width / 2,
            y: rect.top - baseRect.top - gap,
        };
    }

    function getStorylinePoints(baseRect) {
        const titleTarget = storylineRoot.querySelector('.background-title');
        const storyImages = Array.from(storylineRoot.querySelectorAll('.story-img'));
        const continueTarget = storylineRoot.querySelector('.continue-wrapper');

        const points = [];

        if (titleTarget) {
            points.push(getTitleExitPoint(titleTarget, baseRect));
        }

        storyImages.forEach((image) => {
            points.push(getCenterPoint(image, baseRect));
        });

        if (continueTarget) {
            points.push(getContinueEntryPoint(continueTarget, baseRect));
        }

        return points;
    }

    function buildSmoothPath(points) {
        if (points.length < 2) return '';

        let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
        const tension = 0.72;

        for (let i = 0; i < points.length - 1; i += 1) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[i + 2] || p2;

            const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
            const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
            const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
            const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

            path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
        }

        return path;
    }

    function rebuildStoryline() {
        if (!desktopQuery.matches) {
            pathLength = 0;
            storylinePath.setAttribute('d', '');
            return;
        }

        const rootRect = storylineRoot.getBoundingClientRect();
        const points = getStorylinePoints(rootRect);

        storylineSvg.setAttribute('viewBox', `0 0 ${rootRect.width} ${rootRect.height}`);
        storylineSvg.setAttribute('width', String(rootRect.width));
        storylineSvg.setAttribute('height', String(rootRect.height));
        storylinePath.setAttribute('d', buildSmoothPath(points));

        try {
            pathLength = storylinePath.getTotalLength();
        } catch (error) {
            pathLength = 0;
        }

        updateStorylineOrb();
    }

    function getScrollProgress() {
        const rect = storylineRoot.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;
        const rootTop = rect.top + scrollY;
        const rootBottom = rootTop + storylineRoot.offsetHeight;
        const start = rootTop - window.innerHeight * 0.58;
        const end = rootBottom - window.innerHeight * 0.42;

        if (end <= start) return 0;
        return clamp((scrollY - start) / (end - start), 0, 1);
    }

    function updateStorylineOrb() {
        if (!desktopQuery.matches || !pathLength) return;

        const progress = getScrollProgress();
        const point = storylinePath.getPointAtLength(pathLength * progress);

        storylineOrb.style.left = `${point.x}px`;
        storylineOrb.style.top = `${point.y}px`;
    }

    function requestOrbUpdate() {
        if (ticking) return;
        ticking = true;

        window.requestAnimationFrame(() => {
            updateStorylineOrb();
            ticking = false;
        });
    }

    function requestRebuild() {
        if (resizeTicking) return;
        resizeTicking = true;

        window.requestAnimationFrame(() => {
            rebuildStoryline();
            resizeTicking = false;
        });
    }

    const initialTargets = getStorylineTargets();

    initialTargets.forEach((target) => {
        if (target.tagName === 'IMG') {
            if (target.complete) {
                requestRebuild();
            } else {
                target.addEventListener('load', requestRebuild, { once: true });
            }
        }
    });

    if ('ResizeObserver' in window) {
        const storylineResizeObserver = new ResizeObserver(requestRebuild);
        storylineResizeObserver.observe(storylineRoot);
        initialTargets.forEach((target) => storylineResizeObserver.observe(target));
    }

    window.addEventListener('scroll', requestOrbUpdate, { passive: true });
    window.addEventListener('resize', requestRebuild);
    window.addEventListener('load', requestRebuild);

    if (desktopQuery.addEventListener) {
        desktopQuery.addEventListener('change', requestRebuild);
    } else if (desktopQuery.addListener) {
        desktopQuery.addListener(requestRebuild);
    }

    requestRebuild();
})();
