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
   2. slick-human 淡入切换逻辑
   ========================================== */
(function initSlickHumanSlider() {
    function setupSlickHumanSlider() {
        if (!window.jQuery) {
            console.warn('jQuery 没有成功加载，slick 无法启动。');
            return;
        }

        const $ = window.jQuery;
        const $humanSlider = $('.slick-human .fade');

        if (!$humanSlider.length) return;

        if (typeof $.fn.slick !== 'function') {
            console.warn('slick.min.js 没有成功加载，请检查 slick 的 script 引入。');
            return;
        }

        if ($humanSlider.hasClass('slick-initialized')) {
            $humanSlider.slick('unslick');
        }

        $humanSlider.slick({
            dots: true,
            arrows: true,
            infinite: true,
            speed: 650,
            fade: true,
            cssEase: 'linear',
            autoplay: true,
            autoplaySpeed: 2600,
            pauseOnHover: true,
            adaptiveHeight: false
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSlickHumanSlider);
    } else {
        setupSlickHumanSlider();
    }
})();