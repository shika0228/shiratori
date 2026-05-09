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
      2. 核心画廊 (Muuri + Fancybox) 逻辑
      ========================================== */
   $(window).on('load', function() {
   
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
       grid.filter('.sort01');
   
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