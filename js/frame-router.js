(function () {
  if (window.self === window.top) return;

  const shellPages = new Set([
    "home.html",
    "index.html",
    "character.html",
    "backstory.html",
    "gallery.html",
    "majo_story.html",
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

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a[href]");

    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

    const target = getFrameTarget(link.getAttribute("href"));
    if (!target) return;

    event.preventDefault();
    window.parent.postMessage({
      type: "shiratori:navigate",
      target: target
    }, "*");
  }, true);
})();
