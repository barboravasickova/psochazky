(function () {
  var DESKTOP_BREAKPOINT = 900;
  var wrapOuterSelector = ".booqito-widget-wrap";
  var widgetSelector = ".booqito-widget-wrap .sccz-widget";
  var BOOQITO_ORIGIN = "https://app.booqito.com";
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

  function markReady() {
    var outer = getOuterWrap();
    if (!outer) return;
    outer.classList.remove("booqito-widget-wrap--settling");
    outer.classList.add("booqito-widget-wrap--ready");
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
    clearTimeout(settleTimer);
    settleTimer = setTimeout(markReady, 250);
  }

  function ensureStyleObserver() {
    var iframe = getIframe(getWidget());
    if (!iframe || styleObserver) return;

    styleObserver = new MutationObserver(function () {
      if (shouldApplyDesktopHeight()) scheduleApplies();
    });
    styleObserver.observe(iframe, { attributes: true, attributeFilter: ["style"] });
  }

  function onIframeReady() {
    ensureStyleObserver();
    markSettling();
    scheduleApplies();
  }

  function watchIframeInsert() {
    var widget = getWidget();
    if (!widget) return;

    if (getIframe(widget)) onIframeReady();

    new MutationObserver(function () {
      if (getIframe(widget)) onIframeReady();
    }).observe(widget, { childList: true, subtree: true });
  }

  function handleHeightMessage(event) {
    var data = event.data;
    if (!data || typeof data.height !== "number") return;

    var iframe = getIframe(getWidget());
    if (iframe) {
      if (iframe.contentWindow !== event.source) return;
    } else if (event.origin !== BOOQITO_ORIGIN) {
      return;
    }

    lastHeight = data.height;
    isFullscreen = !!data.fullscreen;
    if (iframe) ensureStyleObserver();
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
  setTimeout(markReady, 3000);
})();
