(function () {
  var DESKTOP_BREAKPOINT = 900;
  var widgetSelector = ".booqito-widget-wrap .sccz-widget";
  var DESKTOP_HEIGHT_BUFFER = 16;
  var MOBILE_HEIGHT_BUFFER = 48;
  var RETRY_DELAYS = [0, 50, 100, 200, 400, 800, 1500, 2500, 4000];
  var targetHeight = null;
  var isFullscreen = false;
  var styleObserver = null;
  var debounceTimer = null;
  var retryTimers = [];
  var scrollTimer = null;

  function isDesktop() {
    return window.innerWidth >= DESKTOP_BREAKPOINT;
  }

  function getWidget() {
    return document.querySelector(widgetSelector);
  }

  function getIframe(widget) {
    return widget ? widget.querySelector("iframe") : null;
  }

  function shouldApply() {
    return !isFullscreen && targetHeight !== null;
  }

  function heightBuffer() {
    return isDesktop() ? DESKTOP_HEIGHT_BUFFER : MOBILE_HEIGHT_BUFFER;
  }

  function clearRetries() {
    retryTimers.forEach(clearTimeout);
    retryTimers = [];
  }

  function clearAppliedHeight() {
    var widget = getWidget();
    var iframe = getIframe(widget);
    if (!widget) return;

    ["height", "min-height", "max-height", "overflow"].forEach(function (prop) {
      widget.style.removeProperty(prop);
    });

    if (iframe) {
      ["height", "min-height", "max-height", "overflow"].forEach(function (prop) {
        iframe.style.removeProperty(prop);
      });
    }
  }

  function formatHeight(value) {
    return Math.ceil(value) + heightBuffer() + "px";
  }

  function applyHeight() {
    if (!shouldApply()) return;

    var widget = getWidget();
    var iframe = getIframe(widget);
    if (!widget || !iframe) return;

    var height = formatHeight(targetHeight);
    iframe.setAttribute("scrolling", "no");

    iframe.style.setProperty("height", height, "important");
    iframe.style.setProperty("min-height", height, "important");
    iframe.style.setProperty("max-height", "none", "important");

    widget.style.setProperty("height", height, "important");
    widget.style.setProperty("min-height", height, "important");

    if (isDesktop()) {
      iframe.style.setProperty("overflow", "hidden", "important");
      widget.style.setProperty("overflow", "hidden", "important");
    } else {
      iframe.style.removeProperty("overflow");
      widget.style.removeProperty("overflow");
    }
  }

  function scheduleApplies() {
    clearRetries();
    applyHeight();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(applyHeight, 50);

    requestAnimationFrame(function () {
      requestAnimationFrame(applyHeight);
    });

    RETRY_DELAYS.forEach(function (delay) {
      retryTimers.push(setTimeout(applyHeight, delay));
    });
  }

  function updateTargetHeight(nextHeight) {
    if (targetHeight === null || nextHeight >= targetHeight - 20) {
      targetHeight = Math.max(targetHeight || 0, nextHeight);
      return;
    }

    targetHeight = nextHeight;
  }

  function ensureStyleObserver() {
    var iframe = getIframe(getWidget());
    if (!iframe || styleObserver) return;

    styleObserver = new MutationObserver(scheduleApplies);
    styleObserver.observe(iframe, { attributes: true, attributeFilter: ["style"] });
  }

  function onIframeInserted() {
    var iframe = getIframe(getWidget());
    if (!iframe) return;
    iframe.setAttribute("scrolling", "no");
    ensureStyleObserver();
    scheduleApplies();
  }

  function watchIframe() {
    var widget = getWidget();
    if (!widget) return;

    if (getIframe(widget)) onIframeInserted();

    new MutationObserver(function () {
      if (getIframe(widget)) onIframeInserted();
    }).observe(widget, { childList: true, subtree: true });
  }

  window.addEventListener("message", function (event) {
    var data = event.data;
    if (!data || typeof data.height !== "number") return;

    var iframe = getIframe(getWidget());
    if (iframe && iframe.contentWindow !== event.source) return;

    isFullscreen = !!data.fullscreen;

    if (isFullscreen) {
      clearRetries();
      clearAppliedHeight();
      return;
    }

    updateTargetHeight(data.height);
    ensureStyleObserver();
    scheduleApplies();
  });

  window.addEventListener("resize", function () {
    if (shouldApply()) scheduleApplies();
  });

  window.addEventListener(
    "scroll",
    function () {
      if (!shouldApply()) return;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(scheduleApplies, 80);
    },
    { passive: true }
  );

  watchIframe();
})();
