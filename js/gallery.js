/* ==========================================
   1. 汉堡菜单逻辑
   ========================================== */
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
   
   /* ==========================================
      2. 核心画廊 (Muuri + Fancybox) 逻辑
      ========================================== */
   let galleryRevealed = false;

   function waitForVisibleGalleryImages() {
       const activeSortButton = document.querySelector('.sort-btn li.active');
       const activeClassName = activeSortButton ? activeSortButton.className.split(' ')[0] : 'sort01';
       const images = Array.from(document.querySelectorAll(`.item.${activeClassName} img`));
       const waitForImages = images.map((image) => {
           const decodeImage = () => {
               if (typeof image.decode !== 'function') return Promise.resolve();
               return image.decode().catch(() => {});
           };

           if (image.complete) return decodeImage();

           return new Promise((resolve) => {
               image.addEventListener('load', resolve, { once: true });
               image.addEventListener('error', resolve, { once: true });
           }).then(decodeImage);
       });

       return Promise.race([
           Promise.all(waitForImages),
           new Promise((resolve) => setTimeout(resolve, 1200))
       ]);
   }

   function revealGallery() {
       if (galleryRevealed) return;
       galleryRevealed = true;

       requestAnimationFrame(() => {
           requestAnimationFrame(() => {
               document.body.classList.remove('gallery-is-loading');
               document.body.classList.add('gallery-ready');
           });
       });
   }

   function revealGalleryWhenStable() {
       waitForVisibleGalleryImages().then(revealGallery);
   }

   $(window).on('load', function() {
       if (typeof Muuri === 'undefined') {
           revealGallery();
           return;
       }
   
       // --- 初始化 Muuri ---
       var grid = new Muuri('.grid', {
           showDuration: 600,
           showEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
           hideDuration: 600,
           hideEasing: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
           visibleStyles: {
               opacity: '1',
               transform: 'scale(1)'
           },
           hiddenStyles: {
               opacity: '0',
               transform: 'scale(0.5)'
           }
       });
   
       // --- 【关键修改】页面加载后，根据 HTML 里的 active 类立刻过滤一次 ---
       // 这样页面一打开就只显示“时之魔女”，不会和“宝可梦”重叠
       grid.filter('.sort01', {
           onFinish: revealGalleryWhenStable
       });
       setTimeout(revealGalleryWhenStable, 1300);
   
       // --- 分类切换逻辑 ---
       $('.sort-btn li').on('click', function() {
           // 1. 切换按钮高亮
           $(".sort-btn .active").removeClass("active");
           $(this).addClass("active");
   
           // 2. 获取当前点击的类名 (sort01 或 sort02)
           var className = $(this).attr("class").split(' ')[0];
   
           // 3. 执行过滤：只显示选中的类
           grid.filter('.' + className);
       });
   
       // --- Fancybox 设置 ---
       $('[data-fancybox]').fancybox({
           thumbs: {
               autoStart: true,
           },
       });
   
   });
