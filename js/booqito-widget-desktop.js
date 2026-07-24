(function () {
  var DESKTOP_BREAKPOINT = 900;
  var wrapSelector = ".booqito-widget-wrap .sccz-widget";
  var lastHeight = null;
  var isFullscreen = false;

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data.height !== "number") return;

    var wrap = document.querySelector(wrapSelector);
    if (!wrap) return;
    var iframe = wrap.querySelector("iframe");
    if (!iframe || iframe.contentWindow !== event.source) return;

    lastHeight = data.height;
    isFullscreen = !!data.fullscreen;
    scheduleApply(wrap, iframe);
  });

  window.addEventListener("resize", function () {
    var wrap = document.querySelector(wrapSelector);
    if (!wrap || lastHeight === null) return;
    var iframe = wrap.querySelector("iframe");
    if (!iframe) return;
    scheduleApply(wrap, iframe);
  });

  function scheduleApply(wrap, iframe) {
    requestAnimationFrame(function () {
      applyDesktopHeight(wrap, iframe);
    });
  }

  function applyDesktopHeight(wrap, iframe) {
    if (window.innerWidth < DESKTOP_BREAKPOINT || isFullscreen || lastHeight === null) return;
    var height = lastHeight + "px";
    iframe.style.height = height;
    wrap.style.height = height;
  }
})();
