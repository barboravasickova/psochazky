(function () {
  var DESKTOP_BREAKPOINT = 900;
  var wrapOuterSelector = ".booqito-widget-wrap";
  var widgetSelector = ".booqito-widget-wrap .sccz-widget";
  var lastHeight = null;
  var isFullscreen = false;
  var settleTimer = null;
  var scrollTimer = null;
  var retryTimers = [];
  var styleObserver = null;
  var RETRY_DELAYS = [0, 50, 150, 400, 800];

  function getOuterWrap() {
    return document.querySelector(wrapOuterSelector);
  }

  function getWidget() {
    return document.querySelector(widgetSelector);
  }

  function getIframe(widget) {
    return widget ? widget.querySelector("iframe") : null;
  }

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function shouldApplyDesktopHeight() {
    return isDesktop() && !isFullscreen && lastHeight !== null;
  }

  function clearRetries() {
    retryTimers.forEach(clearTimeout);
    retryTimers = [];
  }

  function applyHeight() {
    if (!shouldApplyDesktopHeight()) return;

    var widget = getWidget();
    var iframe = getIframe(widget);
    if (!widget || !iframe) return;

    var height = lastHeight + "px";
    iframe.style.setProperty("height", height, "important");
    widget.style.setProperty("height", height, "important");
    widget.style.setProperty("min-height", height, "important");
  }

  function scheduleApplies() {
    clearRetries();
    RETRY_DELAYS.forEach(function (delay) {
      var id = setTimeout(function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(applyHeight);
        });
      }, delay);
      retryTimers.push(id);
    });
  }

  function markSettling() {
    var outer = getOuterWrap();
    if (!outer) return;

    outer.classList.add("booqito-widget-wrap--settling");
    outer.classList.remove("booqito-widget-wrap--ready");
    clearTimeout(settleTimer);
    settleTimer = setTimeout(function () {
      outer.classList.remove("booqito-widget-wrap--settling");
      outer.classList.remove("booqito-widget-wrap--loading");
      outer.classList.add("booqito-widget-wrap--ready");
    }, 250);
  }

  function ensureStyleObserver() {
    var iframe = getIframe(getWidget());
    if (!iframe || styleObserver) return;

    styleObserver = new MutationObserver(function () {
      if (shouldApplyDesktopHeight()) scheduleApplies();
    });
    styleObserver.observe(iframe, { attributes: true, attributeFilter: ["style"] });
  }

  function watchIframeInsert() {
    var widget = getWidget();
    if (!widget) return;

    new MutationObserver(function () {
      if (getIframe(widget)) {
        ensureStyleObserver();
        scheduleApplies();
      }
    }).observe(widget, { childList: true, subtree: true });
  }

  function handleHeightMessage(event) {
    var data = event.data;
    if (!data || typeof data.height !== "number") return;

    var iframe = getIframe(getWidget());
    if (!iframe || iframe.contentWindow !== event.source) return;

    lastHeight = data.height;
    isFullscreen = !!data.fullscreen;
    ensureStyleObserver();
    markSettling();
    scheduleApplies();
  }

  window.addEventListener("message", handleHeightMessage);
  window.addEventListener("resize", scheduleApplies);
  window.addEventListener(
    "scroll",
    function () {
      if (!shouldApplyDesktopHeight()) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(scheduleApplies, 100);
    },
    { passive: true }
  );

  watchIframeInsert();
})();
