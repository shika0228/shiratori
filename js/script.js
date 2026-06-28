window.addEventListener("load", function () {
  if (window.self !== window.top && window.location.pathname.endsWith("/index.html")) {
    window.location.replace("home.html");
    return;
  }

  if (document.body.classList.contains("shell-opening")) {
    setTimeout(function () {
      document.body.classList.remove("shell-opening");
    }, 2000);
  }

  const opening = document.getElementById("opening");

  if (opening) {
    // CSS动画结束后移除开屏层，避免它残留在页面上影响点击
    setTimeout(function () {
      opening.remove();
    }, 2850);
  }

  const musicButton = document.getElementById("music-btn");
  const musicIcon = musicButton ? musicButton.querySelector(".music-btn-img") : null;

  if (!musicButton || !musicIcon) return;

  const iconOff = "img/music-off.png";
  const iconOn = "img/music-on.png";
  const audioSrc = musicButton.dataset.audioSrc;
  const audio = new Audio(audioSrc);
  audio.loop = true;
  audio.preload = "auto";

  let isPlaying = false;

  function setMusicState(nextPlaying) {
    isPlaying = nextPlaying;
    musicIcon.src = isPlaying ? iconOn : iconOff;
    musicButton.classList.toggle("is-active", isPlaying);
    musicButton.setAttribute("aria-pressed", String(isPlaying));
    musicButton.setAttribute("aria-label", isPlaying ? "关闭音乐" : "播放音乐");
  }

  musicButton.addEventListener("mouseenter", function () {
    musicIcon.src = isPlaying ? iconOff : iconOn;
  });

  musicButton.addEventListener("mouseleave", function () {
    musicIcon.src = isPlaying ? iconOn : iconOff;
  });

  musicButton.addEventListener("click", function () {
    if (isPlaying) {
      audio.pause();
      audio.currentTime = 0;
      setMusicState(false);
      return;
    }

    audio.play()
      .then(function () {
        setMusicState(true);
      })
      .catch(function (error) {
        setMusicState(false);
        console.warn("音乐文件无法播放，请确认音频文件路径存在：", audioSrc, error);
      });
  });

  const frame = document.getElementById("site-frame");

  if (!frame) return;

  const shellPages = new Set([
    "home.html",
    "index.html",
    "character.html",
    "backstory.html",
    "gallery.html",
    "majo.html",
    "poketrainer.html"
  ]);

  function getFrameTarget(rawHref) {
    if (!rawHref || rawHref.startsWith("#")) return null;

    const url = new URL(rawHref, window.location.href);
    if (url.origin !== window.location.origin) return null;

    let pageName = url.pathname.split("/").pop() || "index.html";
    if (pageName === "index.html") pageName = "home.html";
    if (!shellPages.has(pageName)) return null;

    return pageName + url.search + url.hash;
  }

  function bindFrameLinks() {
    const frameWindow = frame.contentWindow;
    const frameDocument = frame.contentDocument;

    if (!frameWindow || !frameDocument) return;

    frameDocument.addEventListener("click", function (event) {
      const link = event.target.closest("a[href]");

      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const target = getFrameTarget(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      frame.src = target;
    }, true);
  }

  frame.addEventListener("load", bindFrameLinks);
  bindFrameLinks();
});
