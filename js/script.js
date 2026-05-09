window.addEventListener("load", function () {
  const opening = document.getElementById("opening");

  if (!opening) return;

  // CSS动画结束后移除开屏层，避免它残留在页面上影响点击
  setTimeout(function () {
    opening.remove();
  }, 4100);
});
