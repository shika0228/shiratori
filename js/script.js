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
  const audioSrcs = {
    main: musicButton.dataset.mainAudioSrc || musicButton.dataset.audioSrc || "./main-bgm.mp3",
    poke: musicButton.dataset.pokeAudioSrc || "./poke-bgm.mp3"
  };
  const audioTracks = {
    main: new Audio(audioSrcs.main),
    poke: new Audio(audioSrcs.poke)
  };

  Object.keys(audioTracks).forEach(function (key) {
    audioTracks[key].loop = true;
    audioTracks[key].preload = "auto";
  });

  let activeAudioKey = "main";
  musicButton.dataset.currentAudioSrc = audioSrcs[activeAudioKey];
  musicButton.dataset.activeAudioKey = activeAudioKey;

  let isPlaying = false;
  let playRequestId = 0;

  function setMusicState(nextPlaying) {
    isPlaying = nextPlaying;
    musicIcon.src = isPlaying ? iconOn : iconOff;
    musicButton.classList.toggle("is-active", isPlaying);
    musicButton.setAttribute("aria-pressed", String(isPlaying));
    musicButton.setAttribute("aria-label", isPlaying ? "关闭音乐" : "播放音乐");
  }

  function getAudioKeyForPage(pageName) {
    return pageName === "poketrainer.html" ? "poke" : "main";
  }

  function resetAudio(key) {
    const track = audioTracks[key];
    if (!track) return;

    track.pause();
    track.currentTime = 0;
  }

  function updateCurrentAudioData() {
    musicButton.dataset.currentAudioSrc = audioSrcs[activeAudioKey];
    musicButton.dataset.activeAudioKey = activeAudioKey;
  }

  function playActiveAudio() {
    playRequestId += 1;
    const requestId = playRequestId;
    const activeAudio = audioTracks[activeAudioKey];

    Object.keys(audioTracks).forEach(function (key) {
      if (key !== activeAudioKey) resetAudio(key);
    });

    activeAudio.play()
      .then(function () {
        if (requestId !== playRequestId) return;
        setMusicState(true);
      })
      .catch(function (error) {
        if (requestId !== playRequestId) return;
        setMusicState(false);
        console.warn("音乐文件播放失败：", audioSrcs[activeAudioKey], error);
      });
  }

  function setActiveAudioKey(nextAudioKey) {
    if (!nextAudioKey || nextAudioKey === activeAudioKey) {
      updateCurrentAudioData();
      return;
    }

    const shouldResume = isPlaying;
    playRequestId += 1;
    resetAudio(activeAudioKey);
    activeAudioKey = nextAudioKey;
    updateCurrentAudioData();

    if (!shouldResume) return;

    playActiveAudio();
  }

  musicButton.addEventListener("mouseenter", function () {
    musicIcon.src = isPlaying ? iconOff : iconOn;
  });

  musicButton.addEventListener("mouseleave", function () {
    musicIcon.src = isPlaying ? iconOn : iconOff;
  });

  musicButton.addEventListener("click", function () {
    if (isPlaying) {
      playRequestId += 1;
      resetAudio("main");
      resetAudio("poke");
      setMusicState(false);
      return;
    }

    playActiveAudio();
  });

  const mainFrame = document.getElementById("site-frame");
  const pokeFrame = document.getElementById("poke-frame");

  if (!mainFrame || !pokeFrame) return;

  let currentMainTarget = mainFrame.getAttribute("src") || "home.html";
  let currentPokeTarget = "";
  let activeTarget = currentMainTarget;

  const shellPages = new Set([
    "home.html",
    "index.html",
    "character.html",
    "backstory.html",
    "gallery.html",
    "majo_story.html",
    "poketrainer.html"
  ]);
  const fadeInPages = new Set([
    "gallery.html",
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

  function getFramePageName(rawTarget) {
    const url = new URL(rawTarget || "home.html", window.location.href);
    return url.pathname.split("/").pop() || "home.html";
  }

  function isPokeTarget(target) {
    return getFramePageName(target) === "poketrainer.html";
  }

  function setFrameTarget(frame, target) {
    if (frame.getAttribute("src") === target) return;
    frame.src = target;
  }

  function setActiveFrame(usePokeFrame) {
    mainFrame.classList.toggle("is-active", !usePokeFrame);
    pokeFrame.classList.toggle("is-active", usePokeFrame);
    mainFrame.hidden = usePokeFrame;
    pokeFrame.hidden = !usePokeFrame;
    mainFrame.style.display = usePokeFrame ? "none" : "block";
    pokeFrame.style.display = usePokeFrame ? "block" : "none";
  }

  function restartFrameFade(frame, target) {
    if (!fadeInPages.has(getFramePageName(target))) return;

    frame.classList.remove("is-entering");
    void frame.offsetWidth;
    frame.classList.add("is-entering");
  }

  function syncShellUrl(target) {
    if (!window.history || !window.history.replaceState) return;

    const url = new URL(window.location.href);
    if (target && target !== "home.html") {
      url.searchParams.set("page", target);
    } else {
      url.searchParams.delete("page");
    }
    window.history.replaceState(null, "", url);
  }

  function updateShellForActiveTarget() {
    const pageName = getFramePageName(activeTarget);
    const isPokePage = pageName === "poketrainer.html";
    const isGalleryPage = pageName === "gallery.html";

    document.body.classList.toggle("shell-poketrainer", isPokePage);
    document.body.classList.toggle("shell-gallery", isGalleryPage);
    setActiveAudioKey(getAudioKeyForPage(pageName));
  }

  function activateTarget(rawTarget, options) {
    const target = getFrameTarget(rawTarget);
    if (!target) return;

    const usePokeFrame = isPokeTarget(target);
    activeTarget = target;

    if (usePokeFrame) {
      currentPokeTarget = target;
      setFrameTarget(pokeFrame, target);
    } else {
      currentMainTarget = target;
      setFrameTarget(mainFrame, target);
    }

    setActiveFrame(usePokeFrame);
    updateShellForActiveTarget();
    restartFrameFade(usePokeFrame ? pokeFrame : mainFrame, target);

    if (!options || options.syncUrl !== false) {
      syncShellUrl(target);
    }
  }

  function readLoadedFrameTarget(frame, fallbackTarget) {
    let loadedHref = "";

    try {
      loadedHref = frame.contentWindow ? frame.contentWindow.location.href : "";
    } catch (error) {
      loadedHref = "";
    }

    return getFrameTarget(loadedHref) || getFrameTarget(frame.getAttribute("src")) || fallbackTarget || "home.html";
  }

  function bindFrameLinks(frame) {
    let frameWindow;
    let frameDocument;

    try {
      frameWindow = frame.contentWindow;
      frameDocument = frame.contentDocument;
    } catch (error) {
      return;
    }

    if (!frameWindow || !frameDocument) return;

    frameDocument.addEventListener("click", function (event) {
      const link = event.target.closest("a[href]");

      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const target = getFrameTarget(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      activateTarget(target);
    }, true);
  }

  function handleFrameLoad(frame, frameKey) {
    const fallbackTarget = frameKey === "poke" ? currentPokeTarget : currentMainTarget;
    const loadedTarget = readLoadedFrameTarget(frame, fallbackTarget);
    const loadedInWrongFrame = (
      (frameKey === "main" && isPokeTarget(loadedTarget)) ||
      (frameKey === "poke" && !isPokeTarget(loadedTarget))
    );

    if (loadedInWrongFrame) {
      bindFrameLinks(frame);
      activateTarget(loadedTarget);
      return;
    }

    if (frameKey === "poke") {
      currentPokeTarget = loadedTarget;
    } else {
      currentMainTarget = loadedTarget;
    }

    if (
      (frameKey === "poke" && pokeFrame.classList.contains("is-active")) ||
      (frameKey === "main" && mainFrame.classList.contains("is-active"))
    ) {
      activeTarget = loadedTarget;
      updateShellForActiveTarget();
      syncShellUrl(loadedTarget);
    }

    bindFrameLinks(frame);
  }

  window.addEventListener("message", function (event) {
    if (event.source !== mainFrame.contentWindow && event.source !== pokeFrame.contentWindow) return;
    if (!event.data || event.data.type !== "shiratori:navigate") return;

    activateTarget(event.data.target);
  });

  mainFrame.addEventListener("load", function () {
    handleFrameLoad(mainFrame, "main");
  });
  pokeFrame.addEventListener("load", function () {
    handleFrameLoad(pokeFrame, "poke");
  });

  const requestedFrameTarget = getFrameTarget(new URLSearchParams(window.location.search).get("page"));
  activateTarget(requestedFrameTarget || currentMainTarget, { syncUrl: false });
  bindFrameLinks(mainFrame);
});
